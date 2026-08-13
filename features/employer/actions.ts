'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { logAudit, requireRole } from '@/lib/auth'
import { sendJobPostedEmails } from '@/lib/email'
import { ownsJob } from '@/features/employer/scope'
import { checkRateLimit } from '@/lib/rate-limit'
import { fail, fieldErrors, ok, type ActionState } from '@/lib/action-state'
import { slugify } from '@/lib/utils'

const postJobSchema = z.object({
  title: z.string().trim().min(3, 'Enter the job title').max(140),
  companyName: z.string().trim().min(2, 'Enter the company name').max(140),
  companyIndustry: z.string().trim().min(2, 'Enter the industry').max(80),
  companyDescription: z
    .string()
    .trim()
    .min(80, 'Write at least a short paragraph about the company — this appears on your profile page')
    .max(4000),
  companyWebsite: z.string().trim().url('Enter a full URL').max(300).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Enter a city, or "Remote"').max(80),
  country: z.string().trim().min(2, 'Enter a country').max(80),
  workMode: z.enum(['ONSITE', 'HYBRID', 'REMOTE']),
  employment: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']),
  experience: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']),
  categorySlug: z.string().trim().optional().or(z.literal('')),
  salaryMin: z.coerce.number().int().min(0).max(100_000_000).optional().or(z.literal(0)),
  salaryMax: z.coerce.number().int().min(0).max(100_000_000).optional().or(z.literal(0)),
  salaryPeriod: z.enum(['HOUR', 'MONTH', 'YEAR']).default('YEAR'),
  currency: z.string().trim().length(3, 'Use a three-letter currency code').toUpperCase(),
  description: z
    .string()
    .trim()
    .min(100, 'Describe the role in at least a short paragraph')
    .max(8000),
  responsibilities: z.string().trim().min(10, 'List at least one responsibility').max(4000),
  requirements: z.string().trim().min(10, 'List at least one requirement').max(4000),
  benefits: z.string().trim().max(2000).optional().or(z.literal('')),
  skills: z.string().trim().min(2, 'List the key skills, comma separated').max(400),
  source: z.enum(['DIRECT', 'LINKEDIN', 'INDEED', 'GLASSDOOR', 'OTHER']).default('DIRECT'),
  externalUrl: z
    .string()
    .trim()
    .url('Enter the full application URL')
    .max(600)
    .optional()
    .or(z.literal('')),
  allowInternal: z.string().optional(),
  contactEmail: z.string().trim().email('Enter a valid contact email'),
})

/** Ensures a slug is unique by appending a counter when needed. */
async function uniqueJobSlug(base: string): Promise<string> {
  let slug = base
  let counter = 2
  while (await prisma.job.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${counter++}`
  }
  return slug
}

export async function postJob(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole(['EMPLOYER', 'ADMIN'], '/employer/post-job')

  if (!(await checkRateLimit('post-job', { limit: 10, windowMs: 60 * 60_000 }))) {
    return fail('Too many listings submitted. Please try again later.')
  }

  const parsed = postJobSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  const values = parsed.data

  // A listing sourced from a partner board must link somewhere.
  if (values.source !== 'DIRECT' && !values.externalUrl) {
    return fail('Add the application URL on the partner site.', {
      externalUrl: 'Required when the listing comes from another board',
    })
  }
  if (values.salaryMin && values.salaryMax && values.salaryMin > values.salaryMax) {
    return fail('The minimum salary is higher than the maximum.', {
      salaryMin: 'Must be lower than the maximum',
    })
  }

  // Reuse the employer's existing company where one exists, otherwise create it
  // unapproved so an admin reviews the profile before it is public.
  const companySlug = slugify(values.companyName)
  let company = await prisma.company.findFirst({
    where: { OR: [{ ownerId: session.userId }, { slug: companySlug }] },
  })

  if (!company) {
    company = await prisma.company.create({
      data: {
        slug: companySlug,
        name: values.companyName,
        industry: values.companyIndustry,
        description: values.companyDescription,
        website: values.companyWebsite || null,
        headquarters: `${values.city}, ${values.country}`,
        ownerId: session.role === 'EMPLOYER' ? session.userId : null,
        approved: session.role === 'ADMIN',
        locations: { create: [{ city: values.city, country: values.country, isPrimary: true }] },
      },
    })
  }

  const category = values.categorySlug
    ? await prisma.category.findUnique({ where: { slug: values.categorySlug }, select: { id: true } })
    : null

  const slug = await uniqueJobSlug(
    slugify(`${values.title}-${values.city === 'Remote' ? values.country : values.city}`),
  )

  const job = await prisma.job.create({
    data: {
      slug,
      title: values.title,
      description: values.description,
      companyId: company.id,
      categoryId: category?.id ?? null,
      authorId: session.userId,
      city: values.city,
      country: values.country,
      workMode: values.workMode,
      employment: values.employment,
      experience: values.experience,
      salaryMin: values.salaryMin || null,
      salaryMax: values.salaryMax || null,
      salaryPeriod: values.salaryPeriod,
      currency: values.currency,
      skills: values.skills,
      responsibilities: values.responsibilities,
      requirements: values.requirements,
      benefits: values.benefits || null,
      source: values.source,
      sourceName:
        values.source === 'DIRECT'
          ? null
          : values.source.charAt(0) + values.source.slice(1).toLowerCase(),
      externalUrl: values.externalUrl || null,
      allowInternal: values.source === 'DIRECT' ? true : values.allowInternal === 'on',
      // Everything is reviewed before publication. This is the main control
      // that keeps low-quality and fraudulent listings off the public site, and
      // it is part of what an AdSense reviewer is assessing. Set
      // AUTO_PUBLISH_JOBS=true to skip the queue while running the site solo.
      status:
        session.role === 'ADMIN' || process.env.AUTO_PUBLISH_JOBS === 'true'
          ? 'PUBLISHED'
          : 'PENDING',
      // Listings expire after 30 days unless renewed. Google requires stale
      // postings to be removed, and candidates should not apply to dead roles.
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  await logAudit('job.created', 'Job', job.id, { title: job.title, source: job.source })

  // Confirmation to the recruiter and a copy to the admin moderation queue.
  await sendJobPostedEmails({
    jobId: job.id,
    jobTitle: job.title,
    jobSlug: job.slug,
    companyName: company.name,
    location: job.workMode === 'REMOTE' ? `Remote — ${job.country}` : `${job.city}, ${job.country}`,
    status: job.status,
    recruiterEmail: values.contactEmail,
    recruiterName: session.name,
    source: job.source,
    externalUrl: job.externalUrl,
  })

  revalidatePath('/employer/jobs')
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath('/feeds/jobs.xml')

  return ok(
    job.status === 'PUBLISHED'
      ? 'Job published — it is live on the site now and candidates can apply.'
      : `Job received. It is queued for review and is NOT live yet — an admin approves listings before they appear, usually within a few hours. We have emailed a confirmation to ${values.contactEmail}, and again when it publishes.`,
  )
}

const statusSchema = z.enum(['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'])

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
): Promise<void> {
  const session = await requireRole(['EMPLOYER', 'ADMIN'], '/employer/applications')
  const parsed = statusSchema.safeParse(status)
  if (!parsed.success) return

  // Employers may only touch applications for their own company's jobs.
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      job: { select: { authorId: true, company: { select: { ownerId: true } } } },
    },
  })
  if (!application) return
  if (!ownsJob(session, application.job)) return

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: parsed.data },
  })

  await logAudit('application.status', 'Application', applicationId, { status: parsed.data })
  revalidatePath('/employer/applications')
}

export async function closeJob(jobId: string): Promise<void> {
  const session = await requireRole(['EMPLOYER', 'ADMIN'], '/employer/jobs')

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, slug: true, authorId: true, company: { select: { ownerId: true } } },
  })
  if (!job) return
  if (!ownsJob(session, job)) return

  await prisma.job.update({ where: { id: jobId }, data: { status: 'CLOSED' } })
  await logAudit('job.closed', 'Job', jobId)
  revalidatePath('/employer/jobs')
  revalidatePath(`/jobs/${job.slug}`)
  revalidatePath('/jobs')
  revalidatePath('/feeds/jobs.xml')
}

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
  // Required: the four things a listing genuinely cannot exist without.
  title: z.string().trim().min(3, 'Enter the job title').max(140),
  companyName: z.string().trim().min(2, 'Enter the company name').max(140),
  city: z.string().trim().min(2, 'Enter a city, or "Remote"').max(80),
  country: z.string().trim().min(2, 'Enter a country').max(80),
  description: z
    .string()
    .trim()
    .min(40, 'Add a few lines about the role — pick a template above if it helps')
    .max(8000),

  // How candidates apply. Everything else about the listing is optional.
  applyMethod: z.enum(['EASY', 'EXTERNAL']).default('EASY'),
  externalUrl: z.string().trim().max(600).optional().or(z.literal('')),
  externalBoard: z.enum(['LINKEDIN', 'INDEED', 'GLASSDOOR', 'OTHER']).default('OTHER'),

  // Optional detail. A blank field here must never block a posting.
  companyIndustry: z.string().trim().max(80).optional().or(z.literal('')),
  companyDescription: z.string().trim().max(4000).optional().or(z.literal('')),
  companyWebsite: z.string().trim().max(300).optional().or(z.literal('')),
  workMode: z.enum(['ONSITE', 'HYBRID', 'REMOTE']).default('ONSITE'),
  employment: z
    .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'])
    .default('FULL_TIME'),
  experience: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']).default('MID'),
  categorySlug: z.string().trim().optional().or(z.literal('')),
  salaryMin: z.coerce.number().int().min(0).max(1_000_000_000).optional().or(z.literal(0)),
  salaryMax: z.coerce.number().int().min(0).max(1_000_000_000).optional().or(z.literal(0)),
  salaryPeriod: z.enum(['HOUR', 'MONTH', 'YEAR']).default('MONTH'),
  currency: z.string().trim().max(3).optional().or(z.literal('')),
  responsibilities: z.string().trim().max(4000).optional().or(z.literal('')),
  requirements: z.string().trim().max(4000).optional().or(z.literal('')),
  benefits: z.string().trim().max(2000).optional().or(z.literal('')),
  skills: z.string().trim().max(400).optional().or(z.literal('')),
  // Defaults to the signed-in recruiter's own address — we already know it, so
  // asking again is one more field between them and a posted job.
  contactEmail: z.string().trim().max(200).optional().or(z.literal('')),
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
  const isEasyApply = values.applyMethod === 'EASY'

  // The only conditional requirement left: if candidates apply elsewhere, we
  // need to know where. Accept a bare domain and repair it rather than
  // rejecting — "acme.com/careers" is what people actually type.
  let externalUrl = values.externalUrl?.trim() ?? ''
  if (!isEasyApply) {
    if (!externalUrl) {
      return fail('Add the link where candidates should apply.', {
        externalUrl: 'Required when candidates apply on your own site',
      })
    }
    if (!/^https?:\/\//i.test(externalUrl)) externalUrl = `https://${externalUrl}`
    try {
      new URL(externalUrl)
    } catch {
      return fail('That application link does not look like a valid web address.', {
        externalUrl: 'Enter a link such as https://yourcompany.com/careers',
      })
    }
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
        industry: values.companyIndustry || 'General',
        // A company profile still needs something readable on it, so fall back
        // to a plain factual line rather than blocking the posting.
        description:
          values.companyDescription ||
          `${values.companyName} is hiring in ${values.city}, ${values.country}. This profile was created from a job posting and has not yet been expanded by the employer.`,
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
      currency: (values.currency || 'NGN').toUpperCase(),
      skills: values.skills || '',
      responsibilities: values.responsibilities || '',
      requirements: values.requirements || '',
      benefits: values.benefits || null,
      // Easy Apply keeps the application here; otherwise the candidate is sent
      // to the employer's own page, exactly like LinkedIn's two modes.
      source: isEasyApply ? 'DIRECT' : values.externalBoard,
      sourceName: isEasyApply
        ? null
        : values.externalBoard === 'OTHER'
          ? 'the employer site'
          : values.externalBoard.charAt(0) + values.externalBoard.slice(1).toLowerCase(),
      externalUrl: isEasyApply ? null : externalUrl,
      allowInternal: isEasyApply,
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

  await logAudit('job.created', 'Job', job.id, {
    title: job.title,
    source: job.source,
    applyMethod: values.applyMethod,
  })

  // Confirmation to the recruiter and a copy to the admin moderation queue.
  await sendJobPostedEmails({
    jobId: job.id,
    jobTitle: job.title,
    jobSlug: job.slug,
    companyName: company.name,
    location: job.workMode === 'REMOTE' ? `Remote — ${job.country}` : `${job.city}, ${job.country}`,
    status: job.status,
    // Falls back to the account we already have on file.
    recruiterEmail: values.contactEmail || session.email,
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

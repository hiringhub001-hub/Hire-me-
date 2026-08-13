'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { getSession, logAudit } from '@/lib/auth'
import { sendApplicationEmails } from '@/lib/email'
import { readCvUpload } from '@/lib/cv'
import { checkRateLimit } from '@/lib/rate-limit'
import { fail, fieldErrors, ok, type ActionState } from '@/lib/action-state'

const applicationSchema = z.object({
  jobId: z.string().min(1),
  fullName: z.string().trim().min(2, 'Please enter your full name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  // Optional, by design: a required essay stops good candidates from applying
  // at all, and an empty box is more honest than a padded one.
  coverLetter: z.string().trim().max(5000).optional().or(z.literal('')),
  /** Set when a signed-in candidate reuses the CV already on their profile. */
  useSavedCv: z.string().optional(),
  consent: z.literal('on', {
    errorMap: () => ({ message: 'Please confirm you agree to share your details' }),
  }),
})

export async function applyToJob(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // A motivated candidate legitimately applies to many roles in one sitting,
  // and shared mobile IPs multiply that. The duplicate-application check below
  // is the real guard against spam; this only stops scripted floods.
  if (!(await checkRateLimit('apply', { limit: 40, windowMs: 60 * 60_000 }))) {
    return fail('Too many applications from this network in the last hour. Please try again later.')
  }

  const parsed = applicationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  const upload = await readCvUpload(formData.get('cv'))
  if (upload.error) return fail(upload.error, { cv: upload.error })

  const { jobId, consent: _consent, ...values } = parsed.data

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: 'PUBLISHED' },
    select: {
      id: true,
      slug: true,
      allowInternal: true,
      title: true,
      city: true,
      country: true,
      workMode: true,
      // Notify whoever posted the role, falling back to the company owner.
      author: { select: { email: true, name: true } },
      company: {
        select: { name: true, owner: { select: { email: true, name: true } } },
      },
    },
  })
  if (!job) return fail('This job is no longer accepting applications.')
  if (!job.allowInternal) {
    return fail('This employer takes applications on their own site. Use the Apply button above.')
  }

  const session = await getSession()

  // Either a fresh upload or, for a signed-in candidate who asked to reuse it,
  // a copy of the CV already on their profile.
  let cv = upload.file
  if (!cv && session && values.useSavedCv === 'on') {
    const saved = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { cvData: true, cvFileName: true, cvMimeType: true, cvSize: true },
    })
    if (saved?.cvData) {
      cv = {
        data: new Uint8Array(saved.cvData),
        fileName: saved.cvFileName ?? 'cv.pdf',
        mimeType: saved.cvMimeType ?? 'application/pdf',
        size: saved.cvSize ?? saved.cvData.byteLength,
      }
    }
  }
  if (!cv) {
    return fail('Please attach your CV.', { cv: 'Choose a file from your device' })
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_email: { jobId, email: values.email } },
    select: { id: true },
  })
  if (existing) {
    return fail('You have already applied to this role with that email address.')
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      userId: session?.userId ?? null,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || null,
      coverLetter: values.coverLetter || null,
      cvData: cv.data,
      cvFileName: cv.fileName,
      cvMimeType: cv.mimeType,
      cvSize: cv.size,
    },
    select: { id: true },
  })

  // Keep the CV on the profile too, so the next application is one tap.
  if (session && upload.file) {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        cvData: upload.file.data,
        cvFileName: upload.file.fileName,
        cvMimeType: upload.file.mimeType,
        cvSize: upload.file.size,
      },
    })
  }

  await logAudit('application.created', 'Job', jobId, { title: job.title })

  // Candidate confirmation, recruiter alert and admin copy. Awaited so it runs
  // to completion on serverless, but failures here never fail the application —
  // it is already saved.
  const recruiter = job.author ?? job.company.owner
  await sendApplicationEmails({
    applicationId: application.id,
    candidateName: values.fullName,
    candidateEmail: values.email,
    candidatePhone: values.phone || null,
    cvFileName: cv.fileName,
    coverLetter: values.coverLetter || '',
    jobTitle: job.title,
    jobSlug: job.slug,
    companyName: job.company.name,
    location: job.workMode === 'REMOTE' ? `Remote — ${job.country}` : `${job.city}, ${job.country}`,
    employerEmail: recruiter?.email ?? null,
    employerName: recruiter?.name ?? null,
  })

  revalidatePath(`/jobs/${job.slug}`)
  revalidatePath('/dashboard/applications')
  revalidatePath('/employer/applications')

  return ok(
    `Application sent to ${job.company.name}. We have emailed a confirmation to ${values.email}.`,
  )
}

export async function toggleSavedJob(jobId: string, pathname: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  const existing = await prisma.savedJob.findUnique({
    where: { userId_jobId: { userId: session.userId, jobId } },
    select: { id: true },
  })

  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } })
  } else {
    await prisma.savedJob.create({ data: { userId: session.userId, jobId } })
  }

  revalidatePath(pathname)
  revalidatePath('/dashboard/saved')
}

const alertSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  keywords: z.string().trim().max(120).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  frequency: z.enum(['DAILY', 'WEEKLY']).default('WEEKLY'),
})

export async function createJobAlert(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await checkRateLimit('alert', { limit: 5, windowMs: 60_000 }))) {
    return fail('Please slow down and try again shortly.')
  }

  const parsed = alertSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  const session = await getSession()
  const { email, keywords, location, frequency } = parsed.data

  await prisma.jobAlert.upsert({
    where: {
      email_keywords_location: {
        email,
        keywords: keywords || '',
        location: location || '',
      },
    },
    update: { frequency, active: true },
    create: {
      email,
      keywords: keywords || '',
      location: location || '',
      frequency,
      userId: session?.userId ?? null,
    },
  })

  return ok(
    `Alert saved. We will email ${email} with matching roles — ${frequency === 'DAILY' ? 'once a day' : 'once a week'}. You can unsubscribe from any email.`,
  )
}

/** Fire-and-forget view counter used by the job page. */
export async function recordJobView(jobId: string): Promise<void> {
  await prisma.job.update({ where: { id: jobId }, data: { views: { increment: 1 } } })
}

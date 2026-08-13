'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db'
import { logAudit, requireRole } from '@/lib/auth'

/**
 * Moderation actions. Every one requires an ADMIN session and writes an audit
 * log entry, so approvals and deletions are attributable after the fact.
 */

export async function setJobStatus(jobId: string, status: string): Promise<void> {
  await requireRole(['ADMIN'], '/admin')
  if (!['PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED'].includes(status)) return

  const job = await prisma.job.update({
    where: { id: jobId },
    data: { status },
    select: { slug: true, title: true },
  })

  await logAudit('job.status', 'Job', jobId, { status, title: job.title })
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath(`/jobs/${job.slug}`)
  // Keep the outbound aggregator feed and the XML sitemap in step with what is
  // actually public, so partners never advertise a job we have unpublished.
  revalidatePath('/feeds/jobs.xml')
  revalidatePath('/sitemap.xml')
}

export async function toggleJobFeatured(jobId: string): Promise<void> {
  await requireRole(['ADMIN'], '/admin')
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { featured: true, slug: true } })
  if (!job) return

  await prisma.job.update({ where: { id: jobId }, data: { featured: !job.featured } })
  await logAudit('job.featured', 'Job', jobId, { featured: !job.featured })
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
}

export async function deleteJob(jobId: string): Promise<void> {
  await requireRole(['ADMIN'], '/admin')
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { title: true } })
  if (!job) return

  // Cascades remove the applications, saved records and FAQs for this job.
  await prisma.job.delete({ where: { id: jobId } })
  await logAudit('job.deleted', 'Job', jobId, { title: job.title })
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath('/feeds/jobs.xml')
  revalidatePath('/sitemap.xml')
}

export async function setCompanyApproval(companyId: string, approved: boolean): Promise<void> {
  await requireRole(['ADMIN'], '/admin')
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { approved },
    select: { slug: true, name: true },
  })

  await logAudit('company.approval', 'Company', companyId, { approved, name: company.name })
  revalidatePath('/admin')
  revalidatePath('/companies')
  revalidatePath(`/company/${company.slug}`)
}

export async function setReviewApproval(reviewId: string, approved: boolean): Promise<void> {
  await requireRole(['ADMIN'], '/admin')
  const review = await prisma.companyReview.update({
    where: { id: reviewId },
    data: { approved },
    select: { company: { select: { slug: true } } },
  })

  await logAudit('review.approval', 'CompanyReview', reviewId, { approved })
  revalidatePath(`/company/${review.company.slug}`)
  revalidatePath('/admin')
}

export async function setUserRole(userId: string, role: string): Promise<void> {
  const session = await requireRole(['ADMIN'], '/admin/users')
  if (!['CANDIDATE', 'EMPLOYER', 'ADMIN'].includes(role)) return
  // Prevent an admin from removing their own access and locking the panel.
  if (userId === session.userId) return

  await prisma.user.update({ where: { id: userId }, data: { role } })
  await logAudit('user.role', 'User', userId, { role })
  revalidatePath('/admin/users')
}

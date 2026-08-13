import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { PostJobForm } from '@/features/employer/post-job-form'
import { Card } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Post a job',
  description: 'Post a job on CareerHub, or share a listing you have already published on LinkedIn or Indeed.',
  path: '/employer/post-job',
  noIndex: true,
})

export default async function PostJobPage() {
  const session = await requireRole(['EMPLOYER', 'ADMIN'], '/employer/post-job', '/recruiter-access')

  const [categories, company] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { slug: true, name: true } }),
    prisma.company.findFirst({
      where: { ownerId: session.userId },
      select: { name: true, industry: true, description: true, website: true },
    }),
  ])

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Post a job</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        You can host the application here, or point candidates to a listing you have already
        published on LinkedIn, Indeed or your own careers page. Either way the job gets a full page
        on CareerHub with our own skills breakdown, salary context and interview guidance attached.
      </p>

      <Card className="mt-6">
        <PostJobForm
          categories={categories}
          defaultCompany={
            company
              ? {
                  name: company.name,
                  industry: company.industry,
                  description: company.description,
                  website: company.website ?? '',
                }
              : undefined
          }
        />
      </Card>
    </div>
  )
}

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
        Five fields and you are done. Type the job title and we will offer a ready-made description
        you can edit — everything else is optional. Choose Easy Apply to receive applications here,
        or send candidates to your own site.
      </p>

      <Card className="mt-6">
        <PostJobForm
          categories={categories}
          recruiterEmail={session.email}
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

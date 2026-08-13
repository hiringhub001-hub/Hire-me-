import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/auth'
import { JobCardList } from '@/features/jobs/job-card'
import { ButtonLink, EmptyState } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Saved jobs',
  description: 'Jobs you have saved on CareerHub.',
  path: '/dashboard/saved',
  noIndex: true,
})

export default async function SavedJobsPage() {
  const session = await requireSession('/dashboard/saved')

  const saved = await prisma.savedJob.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      job: {
        select: {
          id: true,
          slug: true,
          title: true,
          city: true,
          country: true,
          workMode: true,
          employment: true,
          experience: true,
          salaryMin: true,
          salaryMax: true,
          salaryPeriod: true,
          currency: true,
          skills: true,
          source: true,
          sourceName: true,
          externalUrl: true,
          allowInternal: true,
          featured: true,
          postedAt: true,
          editorialSummary: true,
          description: true,
          company: { select: { name: true, slug: true, logoUrl: true, industry: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  })

  const jobs = saved.map((item) => item.job)

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Saved jobs</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Saved roles stay here even if the listing is later closed, so you keep a record of what you
        were interested in.
      </p>
      <div className="mt-6">
        {jobs.length ? (
          <JobCardList jobs={jobs} />
        ) : (
          <EmptyState
            title="Nothing saved yet"
            description="Tap Save on any job to keep it here. It works for partner listings from LinkedIn and Indeed too, so you can track everything in one place."
            action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
          />
        )}
      </div>
    </div>
  )
}

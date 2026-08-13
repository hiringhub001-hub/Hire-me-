import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { employerJobScope } from '@/features/employer/scope'
import { closeJob } from '@/features/employer/actions'
import { ShareJob } from '@/features/jobs/share-job'
import { Badge, ButtonLink, EmptyState } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/utils'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Your jobs',
  description: 'Manage your job listings.',
  path: '/employer/jobs',
  noIndex: true,
})

const statusTone = {
  PUBLISHED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  CLOSED: 'neutral',
} as const

export default async function EmployerJobsPage() {
  const session = await requireRole(['EMPLOYER', 'ADMIN'], '/employer/jobs', '/recruiter-access')
  const where = employerJobScope(session)

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      source: true,
      views: true,
      city: true,
      country: true,
      createdAt: true,
      company: { select: { name: true } },
      _count: { select: { applications: true } },
    },
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your jobs</h2>
        <ButtonLink href="/employer/post-job" size="sm">
          Post a job
        </ButtonLink>
      </div>

      <div className="mt-6">
        {jobs.length ? (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {jobs.map((job) => (
              <li key={job.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone[job.status as keyof typeof statusTone] ?? 'neutral'}>
                        {job.status}
                      </Badge>
                      {job.source !== 'DIRECT' ? <Badge>via {job.source}</Badge> : null}
                    </div>
                    <p className="mt-1.5 font-medium text-slate-900 dark:text-white">
                      {job.status === 'PUBLISHED' ? (
                        <Link href={`/jobs/${job.slug}`} className="hover:underline">
                          {job.title}
                        </Link>
                      ) : (
                        job.title
                      )}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {job.city}, {job.country} · posted {formatDate(job.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {job.views} views · {job._count.applications} applications
                    </p>
                  </div>

                  {job.status !== 'CLOSED' ? (
                    <form
                      action={async () => {
                        'use server'
                        await closeJob(job.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Close listing
                      </button>
                    </form>
                  ) : null}
                </div>

                {/* Promote the listing off-site — traffic comes back here. */}
                {job.status === 'PUBLISHED' ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-brand-600 hover:underline">
                      Share this job on LinkedIn, Indeed and WhatsApp
                    </summary>
                    <div className="mt-3">
                      <ShareJob
                        url={absoluteUrl(`/jobs/${job.slug}`)}
                        title={job.title}
                        company={job.company.name}
                        variant="recruiter"
                      />
                    </div>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No listings yet"
            description="Post your first job, or share a listing you have already published on LinkedIn or Indeed."
            action={<ButtonLink href="/employer/post-job">Post a job</ButtonLink>}
          />
        )}
      </div>
    </div>
  )
}

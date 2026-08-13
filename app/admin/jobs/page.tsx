import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { deleteJob, setJobStatus, toggleJobFeatured } from '@/features/admin/actions'
import { Badge, Card } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'
import { csv, formatSalary, timeAgo } from '@/lib/utils'

export const metadata: Metadata = buildMetadata({
  title: 'Moderate jobs',
  description: 'Approve, reject and feature job listings.',
  path: '/admin/jobs',
  noIndex: true,
})

const filters = ['PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED'] as const

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireRole(['ADMIN'], '/admin/jobs')
  const { status } = await searchParams
  const active = filters.includes(status as (typeof filters)[number]) ? status : 'PENDING'

  const jobs = await prisma.job.findMany({
    where: { status: active },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      city: true,
      country: true,
      source: true,
      externalUrl: true,
      featured: true,
      skills: true,
      salaryMin: true,
      salaryMax: true,
      salaryPeriod: true,
      currency: true,
      createdAt: true,
      company: { select: { name: true, approved: true } },
    },
  })

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Moderate jobs</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Reject anything that asks candidates for payment, hides the employer&apos;s identity,
        duplicates an existing listing, or has a description too thin to build a useful page from.
      </p>

      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Filter by status">
        {filters.map((filter) => (
          <Link
            key={filter}
            href={`/admin/jobs?status=${filter}`}
            aria-current={active === filter ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              active === filter
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {filter}
          </Link>
        ))}
      </nav>

      <ul className="mt-6 space-y-3">
        {jobs.map((job) => (
          <li key={job.id}>
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {job.source !== 'DIRECT' ? <Badge>via {job.source}</Badge> : null}
                    {job.featured ? <Badge tone="warning">Featured</Badge> : null}
                    {!job.company.approved ? (
                      <Badge tone="danger">Company not approved</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 font-semibold text-slate-900 dark:text-white">{job.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {job.company.name} · {job.city}, {job.country} ·{' '}
                    {formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod) ??
                      'no salary'}{' '}
                    · {timeAgo(job.createdAt)}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                    {job.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Skills: {csv(job.skills).join(', ') || 'none listed'}
                  </p>
                  {job.externalUrl ? (
                    <a
                      href={job.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-1 inline-block text-xs text-brand-600 hover:underline"
                    >
                      Check the source listing →
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                {active !== 'PUBLISHED' ? (
                  <form
                    action={async () => {
                      'use server'
                      await setJobStatus(job.id, 'PUBLISHED')
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Publish
                    </button>
                  </form>
                ) : (
                  <>
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      View page
                    </Link>
                    <form
                      action={async () => {
                        'use server'
                        await toggleJobFeatured(job.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        {job.featured ? 'Unfeature' : 'Feature'}
                      </button>
                    </form>
                  </>
                )}

                {active !== 'REJECTED' ? (
                  <form
                    action={async () => {
                      'use server'
                      await setJobStatus(job.id, 'REJECTED')
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 dark:border-amber-800 dark:text-amber-300"
                    >
                      Reject
                    </button>
                  </form>
                ) : null}

                <form
                  action={async () => {
                    'use server'
                    await deleteJob(job.id)
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:text-red-300"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </Card>
          </li>
        ))}
        {jobs.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            No jobs with status {active}.
          </li>
        ) : null}
      </ul>
    </div>
  )
}

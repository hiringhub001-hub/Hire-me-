import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/auth'
import { JobCard } from '@/features/jobs/job-card'
import { getFeaturedJobs } from '@/features/jobs/queries'
import { ButtonLink, Card, EmptyState } from '@/components/ui'
import { applicationStatusLabels, csv, timeAgo } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Your dashboard',
  description: 'Track saved jobs, applications and profile completeness.',
  path: '/dashboard',
  noIndex: true,
})

export default async function DashboardPage() {
  const session = await requireSession('/dashboard')

  const [user, savedCount, applications, recommended] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { headline: true, location: true, skills: true, resumeUrl: true, phone: true },
    }),
    prisma.savedJob.count({ where: { userId: session.userId } }),
    prisma.application.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        job: { select: { slug: true, title: true, company: { select: { name: true } } } },
      },
    }),
    getFeaturedJobs(4),
  ])

  // Profile completeness drives the prompt below; each field is worth 20%.
  const checks = [
    { label: 'Add a professional headline', done: Boolean(user.headline), href: '/dashboard/profile' },
    { label: 'Add your location', done: Boolean(user.location), href: '/dashboard/profile' },
    { label: 'List your skills', done: csv(user.skills).length > 0, href: '/dashboard/profile' },
    { label: 'Add a link to your CV', done: Boolean(user.resumeUrl), href: '/dashboard/profile' },
    { label: 'Add a phone number', done: Boolean(user.phone), href: '/dashboard/profile' },
  ]
  const complete = checks.filter((check) => check.done).length
  const percent = Math.round((complete / checks.length) * 100)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Saved jobs', value: savedCount, href: '/dashboard/saved' },
          { label: 'Applications', value: applications.length, href: '/dashboard/applications' },
          { label: 'Profile complete', value: `${percent}%`, href: '/dashboard/profile' },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-slate-200 p-5 transition hover:border-brand-300 dark:border-slate-800"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </Link>
        ))}
      </div>

      {percent < 100 ? (
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-white">Finish your profile</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            A complete profile pre-fills your applications and makes them faster to send.
          </p>
          <div
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completeness"
          >
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {checks
              .filter((check) => !check.done)
              .map((check) => (
                <li key={check.label}>
                  <Link href={check.href} className="text-sm text-brand-600 hover:underline">
                    {check.label} →
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
      ) : null}

      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent applications</h2>
        {applications.length ? (
          <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {applications.map((application) => (
              <li key={application.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/jobs/${application.job.slug}`}
                    className="font-medium text-slate-900 hover:underline dark:text-white"
                  >
                    {application.job.title}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {application.job.company.name} · applied {timeAgo(application.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {applicationStatusLabels[application.status] ?? application.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No applications yet"
              description="When you apply through CareerHub, your applications appear here with their status."
              action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
            />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Jobs you might like</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recommended.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  )
}

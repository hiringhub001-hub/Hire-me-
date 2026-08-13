import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { employerJobScope } from '@/features/employer/scope'
import { ButtonLink, Card } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'
import { timeAgo } from '@/lib/utils'

export const metadata: Metadata = buildMetadata({
  title: 'Employer dashboard',
  description: 'Manage your job listings and applicants.',
  path: '/employer',
  noIndex: true,
})

export default async function EmployerHome() {
  const session = await requireRole(['EMPLOYER', 'ADMIN'], '/employer', '/recruiter-access')

  const isAdmin = session.role === 'ADMIN'
  const jobWhere = employerJobScope(session)

  const [company, jobs, published, pending, applications, recent] = await Promise.all([
    prisma.company.findFirst({ where: { ownerId: session.userId } }),
    prisma.job.count({ where: jobWhere }),
    prisma.job.count({ where: { ...jobWhere, status: 'PUBLISHED' } }),
    prisma.job.count({ where: { ...jobWhere, status: 'PENDING' } }),
    prisma.application.count({ where: { job: jobWhere } }),
    prisma.application.findMany({
      where: { job: jobWhere },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        createdAt: true,
        status: true,
        job: { select: { title: true, slug: true } },
      },
    }),
  ])

  const stats = [
    { label: 'Total listings', value: jobs },
    { label: 'Published', value: published },
    { label: 'Awaiting review', value: pending },
    { label: 'Applications', value: applications },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {!company && !isAdmin ? (
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Set up your company profile
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Your company profile is created the first time you post a job, and it becomes a public
            page listing all your open roles, benefits and culture. Candidates read it before they
            apply, so it is worth writing properly.
          </p>
          <ButtonLink href="/employer/post-job" className="mt-4">
            Post your first job
          </ButtonLink>
        </Card>
      ) : null}

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent applicants</h2>
          <Link href="/employer/applications" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {recent.length ? (
          <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {recent.map((application) => (
              <li key={application.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {application.fullName}
                  </p>
                  <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                    {application.job.title} · {timeAgo(application.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {application.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            No applications yet. Applications sent through CareerHub appear here; if your listing
            points to LinkedIn or Indeed, those applications arrive on that platform instead.
          </p>
        )}
      </section>
    </div>
  )
}

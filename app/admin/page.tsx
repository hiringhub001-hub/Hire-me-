import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { setCompanyApproval, setReviewApproval } from '@/features/admin/actions'
import { Badge, Card } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'
import { timeAgo } from '@/lib/utils'

export const metadata: Metadata = buildMetadata({
  title: 'Admin overview',
  description: 'Moderation and site statistics.',
  path: '/admin',
  noIndex: true,
})

export default async function AdminHome() {
  await requireRole(['ADMIN'], '/admin')

  const [
    pendingJobs,
    publishedJobs,
    users,
    applications,
    pendingCompanies,
    pendingReviews,
    auditLog,
  ] = await Promise.all([
    prisma.job.count({ where: { status: 'PENDING' } }),
    prisma.job.count({ where: { status: 'PUBLISHED' } }),
    prisma.user.count(),
    prisma.application.count(),
    prisma.company.findMany({
      where: { approved: false },
      select: { id: true, name: true, industry: true, description: true, createdAt: true },
    }),
    prisma.companyReview.findMany({
      where: { approved: false },
      select: {
        id: true,
        title: true,
        body: true,
        rating: true,
        authorName: true,
        company: { select: { name: true } },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        action: true,
        entity: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ])

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Awaiting review', value: pendingJobs, href: '/admin/jobs?status=PENDING' },
          { label: 'Published jobs', value: publishedJobs, href: '/admin/jobs' },
          { label: 'Users', value: users, href: '/admin/users' },
          { label: 'Applications', value: applications, href: '/employer/applications' },
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

      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Companies awaiting approval
        </h2>
        {pendingCompanies.length ? (
          <ul className="mt-4 space-y-3">
            {pendingCompanies.map((company) => (
              <li key={company.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{company.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {company.industry} · submitted {timeAgo(company.createdAt)}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                        {company.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form
                        action={async () => {
                          'use server'
                          await setCompanyApproval(company.id, true)
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      </form>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Nothing waiting.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reviews awaiting moderation</h2>
        {pendingReviews.length ? (
          <ul className="mt-4 space-y-3">
            {pendingReviews.map((review) => (
              <li key={review.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {review.title} <Badge tone="success">{review.rating}/5</Badge>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {review.company.name} · {review.authorName}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{review.body}</p>
                    </div>
                    <form
                      action={async () => {
                        'use server'
                        await setReviewApproval(review.id, true)
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Publish
                      </button>
                    </form>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Nothing waiting.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent activity</h2>
        <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
          {auditLog.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 p-3">
              <span className="text-slate-700 dark:text-slate-300">
                <code className="font-mono text-xs">{entry.action}</code> on {entry.entity}
                {entry.user ? ` by ${entry.user.email}` : ''}
              </span>
              <span className="shrink-0 text-xs text-slate-500">{timeAgo(entry.createdAt)}</span>
            </li>
          ))}
          {auditLog.length === 0 ? (
            <li className="p-3 text-slate-600 dark:text-slate-400">No activity recorded yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  )
}

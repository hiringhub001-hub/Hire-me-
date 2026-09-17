import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { Badge } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Visitors',
  description: 'Who is arriving on the site, including visitors who never sign up.',
  path: '/admin/visitors',
  noIndex: true,
})

/**
 * Traffic, including the people no other admin page can see.
 *
 * Registered users are easy to count; the overwhelming majority of a job board's
 * audience never creates an account, reads two pages and leaves. This is the
 * only view of them.
 *
 * "Visitors" is a count of distinct daily keys, not of people: the key is a
 * salted hash that is thrown away each midnight, so somebody returning tomorrow
 * counts twice. That is the deliberate trade — see lib/visits.ts.
 */
const PAGE_SIZE = 50

type Search = { page?: string; days?: string }

function startOfDaysAgo(days: number): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function timeAgo(value: Date): string {
  const seconds = Math.round((Date.now() - value.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.round(hours / 24)} d ago`
}

export default async function AdminVisitorsPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  await requireRole(['ADMIN'], '/admin/visitors')
  const { page, days } = await searchParams

  const window = Math.min(90, Math.max(1, Number.parseInt(days ?? '7', 10) || 7))
  const current = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
  const since = startOfDaysAgo(window - 1)
  const today = startOfDaysAgo(0)

  const [
    totalAll,
    visitsToday,
    visitsWindow,
    guestVisits,
    visits,
    uniqueToday,
    uniqueWindow,
    topPages,
    topReferrers,
    devices,
  ] = await Promise.all([
    prisma.visit.count(),
    prisma.visit.count({ where: { createdAt: { gte: today } } }),
    prisma.visit.count({ where: { createdAt: { gte: since } } }),
    prisma.visit.count({ where: { createdAt: { gte: since }, userId: null } }),
    prisma.visit.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        path: true,
        referrer: true,
        device: true,
        browser: true,
        country: true,
        createdAt: true,
        user: { select: { email: true, role: true } },
      },
    }),
    prisma.visit.findMany({
      where: { createdAt: { gte: today } },
      distinct: ['visitorKey'],
      select: { visitorKey: true },
    }),
    prisma.visit.findMany({
      where: { createdAt: { gte: since } },
      distinct: ['visitorKey'],
      select: { visitorKey: true },
    }),
    prisma.visit.groupBy({
      by: ['path'],
      where: { createdAt: { gte: since } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    }),
    prisma.visit.groupBy({
      by: ['referrer'],
      where: { createdAt: { gte: since }, referrer: { not: null } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: 'desc' } },
      take: 8,
    }),
    prisma.visit.groupBy({
      by: ['device'],
      where: { createdAt: { gte: since } },
      _count: { device: true },
      orderBy: { _count: { device: 'desc' } },
    }),
  ])

  const pages = Math.max(1, Math.ceil(visitsWindow / PAGE_SIZE))
  const signedInVisits = visitsWindow - guestVisits

  const summary = [
    { label: 'Visits today', value: visitsToday },
    { label: 'Visitors today', value: uniqueToday.length },
    { label: `Visits (${window}d)`, value: visitsWindow },
    { label: `Visitors (${window}d)`, value: uniqueWindow.length },
    { label: 'Guests', value: guestVisits },
    { label: 'Signed in', value: signedInVisits },
  ]

  function href(next: { page?: number; days?: number }) {
    const params = new URLSearchParams()
    const d = next.days ?? window
    if (d !== 7) params.set('days', String(d))
    if ((next.page ?? 1) > 1) params.set('page', String(next.page))
    const suffix = params.toString()
    return `/admin/visitors${suffix ? `?${suffix}` : ''}`
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Visitors</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Everyone who opens a page, whether or not they have an account. No IP addresses are stored:
        a visitor is counted by a hash that is re-salted every midnight, so someone returning
        tomorrow counts as a new visitor. {totalAll.toLocaleString()} page views recorded in total.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 7, 30, 90].map((option) => (
          <Link
            key={option}
            href={href({ days: option, page: 1 })}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              option === window
                ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {option === 1 ? 'Today' : `${option} days`}
          </Link>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
          >
            <dt className="text-xs text-slate-600 dark:text-slate-400">{item.label}</dt>
            <dd className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Most read</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {topPages.length === 0 ? (
              <li className="text-slate-500">Nothing yet.</li>
            ) : (
              topPages.map((row) => (
                <li key={row.path} className="flex items-baseline justify-between gap-3">
                  <Link href={row.path} className="truncate text-brand-600 hover:underline">
                    {row.path}
                  </Link>
                  <span className="shrink-0 text-slate-600 dark:text-slate-400">
                    {row._count.path}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Where they came from</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {topReferrers.length === 0 ? (
              <li className="text-slate-500">All direct traffic so far.</li>
            ) : (
              topReferrers.map((row) => (
                <li key={row.referrer} className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-slate-700 dark:text-slate-300">{row.referrer}</span>
                  <span className="shrink-0 text-slate-600 dark:text-slate-400">
                    {row._count.referrer}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Devices</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {devices.length === 0 ? (
              <li className="text-slate-500">Nothing yet.</li>
            ) : (
              devices.map((row) => (
                <li key={row.device} className="flex items-baseline justify-between gap-3">
                  <span className="text-slate-700 dark:text-slate-300">{row.device}</span>
                  <span className="text-slate-600 dark:text-slate-400">{row._count.device}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <h3 className="mt-8 font-semibold text-slate-900 dark:text-white">Recent page views</h3>
      <div className="relative mt-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left dark:bg-slate-900">
            <tr>
              <th scope="col" className="p-3 font-semibold">
                When
              </th>
              <th scope="col" className="p-3 font-semibold">
                Page
              </th>
              <th scope="col" className="p-3 font-semibold">
                Who
              </th>
              <th scope="col" className="p-3 font-semibold">
                Device
              </th>
              <th scope="col" className="p-3 font-semibold">
                From
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {visits.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No visits recorded in this period yet.
                </td>
              </tr>
            ) : (
              visits.map((visit) => (
                <tr key={visit.id}>
                  <td className="whitespace-nowrap p-3 text-slate-600 dark:text-slate-400">
                    <time dateTime={visit.createdAt.toISOString()} title={visit.createdAt.toISOString()}>
                      {timeAgo(visit.createdAt)}
                    </time>
                  </td>
                  <td className="max-w-[260px] truncate p-3">
                    <Link href={visit.path} className="text-brand-600 hover:underline">
                      {visit.path}
                    </Link>
                  </td>
                  <td className="p-3">
                    {visit.user ? (
                      <span className="text-slate-700 dark:text-slate-300">{visit.user.email}</span>
                    ) : (
                      <Badge tone="neutral">Guest</Badge>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-3 text-slate-600 dark:text-slate-400">
                    {visit.device} · {visit.browser}
                    {visit.country ? ` · ${visit.country}` : ''}
                  </td>
                  <td className="max-w-[180px] truncate p-3 text-slate-600 dark:text-slate-400">
                    {visit.referrer ?? 'Direct'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
          {current > 1 ? (
            <Link
              href={href({ page: current - 1 })}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {current} of {pages}
          </span>
          {current < pages ? (
            <Link
              href={href({ page: current + 1 })}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  )
}

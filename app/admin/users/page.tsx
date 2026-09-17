import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { setUserRole } from '@/features/admin/actions'
import { Badge } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = buildMetadata({
  title: 'Users',
  description: 'Manage user accounts and roles.',
  path: '/admin/users',
  noIndex: true,
})

const roles = ['CANDIDATE', 'EMPLOYER', 'ADMIN'] as const

/**
 * Every registered account is reachable from here.
 *
 * This page used to `take: 100` with no way to see past that, so the oldest
 * accounts silently disappeared as the site grew — the opposite of a register.
 * It now pages through the whole table, and search and the role filter run in
 * the database rather than over one page of results, so a name typed here finds
 * a user whatever page they would otherwise land on.
 */
const PAGE_SIZE = 50

type Search = { q?: string; role?: string; page?: string }

function isRole(value: string | undefined): value is (typeof roles)[number] {
  return roles.includes((value ?? '') as (typeof roles)[number])
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const session = await requireRole(['ADMIN'], '/admin/users')
  const { q, role, page } = await searchParams

  const query = q?.trim() ?? ''
  const roleFilter = isRole(role) ? role : undefined
  const current = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)

  const where = {
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [total, matching, users, candidates, employers, admins, newThisWeek, googleAccounts] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (current - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          emailVerified: true,
          authProvider: true,
          passwordHash: true,
          _count: { select: { applications: true, postedJobs: true } },
        },
      }),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { passwordHash: null } }),
    ])

  const pages = Math.max(1, Math.ceil(matching / PAGE_SIZE))
  const filtered = Boolean(query || roleFilter)

  /** Keeps the search and role filter attached while paging. */
  function pageHref(target: number) {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (roleFilter) params.set('role', roleFilter)
    if (target > 1) params.set('page', String(target))
    const suffix = params.toString()
    return `/admin/users${suffix ? `?${suffix}` : ''}`
  }

  const summary = [
    { label: 'Total users', value: total },
    { label: 'Job seekers', value: candidates },
    { label: 'Recruiters', value: employers },
    { label: 'Admins', value: admins },
    { label: 'Joined this week', value: newThisWeek },
    { label: 'Google sign-in', value: googleAccounts },
  ]

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Users</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Every account ever registered, newest first. Changing a role takes effect the next time that
        user signs in. You cannot change your own role.
      </p>

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

      <form method="get" className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Search name or email
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="e.g. sarah, @gmail.com"
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <div>
          <label htmlFor="role" className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={roleFilter ?? ''}
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900 sm:w-40"
          >
            <option value="">All roles</option>
            {roles.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold dark:border-slate-700"
        >
          Search
        </button>
        {filtered ? (
          <Link
            href="/admin/users"
            className="flex h-11 items-center justify-center rounded-xl px-3 text-sm font-medium text-brand-600 hover:underline"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        {matching === 0
          ? 'No users match that search.'
          : `Showing ${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, matching)} of ${matching}${filtered ? ` matching (${total} total)` : ''}`}
      </p>

      {/*
        `relative` is load-bearing. An absolutely positioned descendant — a
        visually hidden <label>, a tooltip — is only clipped by an ancestor
        that establishes a containing block, so without it such an element
        escapes this scroller entirely and widens the whole document. That is
        what pushed every admin page sideways on a phone.
      */}
      <div className="relative mt-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left dark:bg-slate-900">
            <tr>
              <th scope="col" className="p-3 font-semibold">
                Name
              </th>
              <th scope="col" className="p-3 font-semibold">
                Email
              </th>
              <th scope="col" className="p-3 font-semibold">
                Sign-in
              </th>
              <th scope="col" className="p-3 font-semibold">
                Activity
              </th>
              <th scope="col" className="p-3 font-semibold">
                Joined
              </th>
              <th scope="col" className="p-3 font-semibold">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-3 font-medium text-slate-900 dark:text-white">{user.name}</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">
                  {user.email}
                  {user.emailVerified ? null : (
                    <span className="ml-1 text-xs text-amber-600">unverified</span>
                  )}
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">
                  {user.passwordHash ? 'Password' : (user.authProvider ?? 'Google')}
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">
                  {user._count.applications} applications · {user._count.postedJobs} jobs
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">
                  {formatDate(user.createdAt)}
                </td>
                <td className="p-3">
                  {user.id === session.userId ? (
                    <Badge tone="brand">{user.role} (you)</Badge>
                  ) : (
                    <form
                      action={async (formData: FormData) => {
                        'use server'
                        await setUserRole(user.id, String(formData.get('role') ?? ''))
                      }}
                      className="flex items-center gap-2"
                    >
                      <label htmlFor={`role-${user.id}`} className="sr-only">
                        Role for {user.name}
                      </label>
                      <select
                        id={`role-${user.id}`}
                        name="role"
                        defaultValue={user.role}
                        className="h-9 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                      >
                        {roles.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
                      >
                        Save
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
          {current > 1 ? (
            <Link
              href={pageHref(current - 1)}
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
              href={pageHref(current + 1)}
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

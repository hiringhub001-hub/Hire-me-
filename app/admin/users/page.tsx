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

export default async function AdminUsersPage() {
  const session = await requireRole(['ADMIN'], '/admin/users')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { applications: true, postedJobs: true } },
    },
  })

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Users</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Changing a role takes effect the next time that user signs in. You cannot change your own
        role.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left dark:bg-slate-900">
            <tr>
              <th scope="col" className="p-3 font-semibold">
                Name
              </th>
              <th scope="col" className="p-3 font-semibold">
                Email
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
                <td className="p-3 text-slate-600 dark:text-slate-400">{user.email}</td>
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
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
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
    </div>
  )
}

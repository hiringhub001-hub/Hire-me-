'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db'
import { createSession, getSession, logAudit, type Role } from '@/lib/auth'

/**
 * Upgrades a job seeker account to a recruiter account, in place.
 *
 * The session is re-issued immediately so the new role takes effect on the very
 * next request — otherwise the user would be bounced straight back here by the
 * employer guard, which is exactly the kind of loop this page exists to avoid.
 */
export async function enableRecruiterAccess(): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Frecruiter-access')
  if (session.role !== 'CANDIDATE') redirect('/employer')

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { role: 'EMPLOYER' },
    select: { id: true, email: true, name: true, role: true },
  })

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  })

  await logAudit('user.recruiter_access', 'User', user.id)

  revalidatePath('/', 'layout')
  redirect('/employer/post-job')
}

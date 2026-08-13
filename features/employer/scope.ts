import 'server-only'

import type { Prisma } from '@prisma/client'

import type { Session } from '@/lib/auth'

/**
 * Which jobs an employer session is allowed to see and manage.
 *
 * A recruiter owns a job if they posted it (`authorId`) or if they own the
 * company it belongs to. Both are needed: the first covers a recruiter posting
 * under a company profile someone else created, the second covers jobs seeded
 * or imported against their company. Admins see everything.
 */
export function employerJobScope(session: Session): Prisma.JobWhereInput {
  if (session.role === 'ADMIN') return {}
  return {
    OR: [{ authorId: session.userId }, { company: { ownerId: session.userId } }],
  }
}

/** True when this session may manage the given job. */
export function ownsJob(
  session: Session,
  job: { authorId: string | null; company: { ownerId: string | null } },
): boolean {
  if (session.role === 'ADMIN') return true
  return job.authorId === session.userId || job.company.ownerId === session.userId
}

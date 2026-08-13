import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { employerJobScope } from '@/features/employer/scope'
import { ApplicantRow } from '@/features/employer/applicant-row'
import { EmptyState, ButtonLink } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Applicants',
  description: 'Review and manage applications.',
  path: '/employer/applications',
  noIndex: true,
})

export default async function EmployerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const session = await requireRole(['EMPLOYER', 'ADMIN'], '/employer/applications', '/recruiter-access')
  const { q, status } = await searchParams

  const jobWhere = employerJobScope(session)

  const applications = await prisma.application.findMany({
    where: {
      job: jobWhere,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q } },
              { email: { contains: q } },
              { coverLetter: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      resumeUrl: true,
      coverLetter: true,
      status: true,
      createdAt: true,
      job: { select: { title: true, slug: true } },
    },
  })

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Applicants</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Applications submitted through CareerHub. Candidates see the status you set here in their own
        dashboard, so keeping it current saves everyone chasing emails.
      </p>

      <form method="get" className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label htmlFor="q" className="sr-only">
          Search applicants
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by name, email or cover letter"
          className="h-11 rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <label htmlFor="status" className="sr-only">
          Filter by status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ''}
          className="h-11 rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">All statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="REVIEWING">In review</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="REJECTED">Not selected</option>
          <option value="HIRED">Hired</option>
        </select>
        <button
          type="submit"
          className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white"
        >
          Filter
        </button>
      </form>

      <div className="mt-6">
        {applications.length ? (
          <ul className="space-y-3">
            {applications.map((application) => (
              <ApplicantRow key={application.id} application={application} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No applications match"
            description="Applications sent through CareerHub appear here as soon as they arrive."
            action={<ButtonLink href="/employer/post-job">Post a job</ButtonLink>}
          />
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/auth'
import { ButtonLink, EmptyState } from '@/components/ui'
import { applicationStatusLabels, formatDate } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Your applications',
  description: 'Applications you have submitted through CareerHub.',
  path: '/dashboard/applications',
  noIndex: true,
})

const statusTone: Record<string, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  REVIEWING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  SHORTLISTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  HIRED: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
}

export default async function ApplicationsPage() {
  const session = await requireSession('/dashboard/applications')

  const applications = await prisma.application.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      job: {
        select: { slug: true, title: true, city: true, country: true, company: { select: { name: true } } },
      },
    },
  })

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your applications</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Applications sent through CareerHub. Roles you applied for on LinkedIn or Indeed are not
        tracked here — save those jobs instead to keep a record.
      </p>

      <div className="mt-6">
        {applications.length ? (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {applications.map((application) => (
              <li key={application.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${application.job.slug}`}
                      className="font-medium text-slate-900 hover:underline dark:text-white"
                    >
                      {application.job.title}
                    </Link>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {application.job.company.name} · {application.job.city},{' '}
                      {application.job.country}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Applied {formatDate(application.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[application.status] ?? statusTone.SUBMITTED}`}
                  >
                    {applicationStatusLabels[application.status] ?? application.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No applications yet"
            description="Applications you send through CareerHub appear here, and the status updates when the employer moves you through their process."
            action={<ButtonLink href="/jobs">Find a job to apply for</ButtonLink>}
          />
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-white">When to follow up</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Ten working days after applying is the right moment for a short, polite follow-up. Keep it
          to three sentences: the role and date you applied, one line on continued interest, and a
          question about the timeline. Our{' '}
          <Link
            href="/blog/applying-to-jobs-on-linkedin-and-indeed"
            className="text-brand-600 hover:underline"
          >
            guide to tracking applications
          </Link>{' '}
          covers the full system.
        </p>
      </div>
    </div>
  )
}

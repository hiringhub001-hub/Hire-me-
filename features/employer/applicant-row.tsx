'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'

import { updateApplicationStatus } from '@/features/employer/actions'
import { applicationStatusLabels, formatDate } from '@/lib/utils'

type Applicant = {
  id: string
  fullName: string
  email: string
  phone: string | null
  cvFileName: string | null
  coverLetter: string | null
  status: string
  createdAt: Date
  job: { title: string; slug: string }
}

const statuses = ['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'] as const

export function ApplicantRow({ application }: { application: Applicant }) {
  const [status, setStatus] = useOptimistic(application.status)
  const [, startTransition] = useTransition()

  return (
    <li className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white">{application.fullName}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <a href={`mailto:${application.email}`} className="hover:underline">
              {application.email}
            </a>
            {application.phone ? ` · ${application.phone}` : ''}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Applied for{' '}
            <Link href={`/jobs/${application.job.slug}`} className="text-brand-600 hover:underline">
              {application.job.title}
            </Link>{' '}
            on {formatDate(application.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor={`status-${application.id}`} className="sr-only">
            Application status for {application.fullName}
          </label>
          <select
            id={`status-${application.id}`}
            value={status}
            onChange={(event) => {
              const next = event.target.value
              startTransition(async () => {
                setStatus(next)
                await updateApplicationStatus(application.id, next)
              })
            }}
            className="h-10 rounded-xl border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {applicationStatusLabels[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {application.cvFileName ? (
        <p className="mt-3 text-sm">
          <a
            href={`/api/applications/${application.id}/cv`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="break-all">{application.cvFileName}</span>
          </a>
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No CV attached.</p>
      )}

      {application.coverLetter ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            Read cover letter
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {application.coverLetter}
          </p>
        </details>
      ) : null}
    </li>
  )
}

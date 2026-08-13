import Link from 'next/link'

import { partnerBoards, type PartnerBoard } from '@/lib/site'
import { csv, employmentLabels, formatSalary, timeAgo, workModeLabels } from '@/lib/utils'
import { Badge } from '@/components/ui'
import type { JobCardData } from '@/features/jobs/queries'

export function SourceBadge({ source, sourceName }: { source: string; sourceName?: string | null }) {
  const board = partnerBoards[source as PartnerBoard] ?? partnerBoards.OTHER
  if (source === 'DIRECT') {
    return <Badge tone="brand">Apply on CareerHub</Badge>
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <span className={`h-2 w-2 rounded-full ${board.color}`} aria-hidden />
      via {sourceName ?? board.label}
    </span>
  )
}

// `min-w-0` on the article matters: as a grid item its automatic minimum would
// otherwise come from the nowrap company line, pushing the whole page wider than
// the screen rather than letting that line truncate.
export function JobCard({ job }: { job: JobCardData }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod)
  const skills = csv(job.skills).slice(0, 4)
  const place = job.workMode === 'REMOTE' ? `Remote · ${job.country}` : `${job.city}, ${job.country}`

  return (
    <article className="group relative min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-md sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700">
      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          aria-hidden
        >
          {job.company.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg dark:text-white">
            {/* Whole-card link target; keeps one focusable element per card. */}
            <Link href={`/jobs/${job.slug}`} className="after:absolute after:inset-0">
              {job.title}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-slate-400">
            {job.company.name} · {place}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {job.featured ? <Badge tone="warning">Featured</Badge> : null}
            <Badge>{workModeLabels[job.workMode] ?? job.workMode}</Badge>
            <Badge>{employmentLabels[job.employment] ?? job.employment}</Badge>
            {salary ? <Badge tone="success">{salary}</Badge> : null}
          </div>

          {skills.length ? (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Key skills">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <SourceBadge source={job.source} sourceName={job.sourceName} />
            <time
              dateTime={new Date(job.postedAt).toISOString()}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              {timeAgo(job.postedAt)}
            </time>
          </div>
        </div>
      </div>
    </article>
  )
}

export function JobCardList({ jobs }: { jobs: JobCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'

import { toggleSavedJob } from '@/features/jobs/actions'
import { cn } from '@/lib/utils'

export function SaveJobButton({
  jobId,
  saved,
  signedIn,
  pathname,
  className,
}: {
  jobId: string
  saved: boolean
  signedIn: boolean
  pathname: string
  className?: string
}) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved)
  const [, startTransition] = useTransition()

  const base = cn(
    'inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 font-semibold transition',
    optimisticSaved
      ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950/50 dark:text-brand-200'
      : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    className,
  )

  if (!signedIn) {
    return (
      <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className={base}>
        <HeartIcon filled={false} />
        Save job
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={optimisticSaved}
      className={base}
      onClick={() => {
        startTransition(async () => {
          setOptimisticSaved(!optimisticSaved)
          await toggleSavedJob(jobId, pathname)
        })
      }}
    >
      <HeartIcon filled={optimisticSaved} />
      {optimisticSaved ? 'Saved' : 'Save job'}
    </button>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
    >
      <path d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z" />
    </svg>
  )
}

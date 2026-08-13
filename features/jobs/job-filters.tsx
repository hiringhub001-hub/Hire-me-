'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import { inputClass } from '@/components/ui'

type Option = { value: string; label: string }

const workModes: Option[] = [
  { value: '', label: 'Any location type' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
]

const employments: Option[] = [
  { value: '', label: 'Any job type' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
]

const experiences: Option[] = [
  { value: '', label: 'Any experience' },
  { value: 'ENTRY', label: 'Entry level' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Mid level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead / Principal' },
]

const sources: Option[] = [
  { value: '', label: 'All sources' },
  { value: 'DIRECT', label: 'Apply on CareerHub' },
  { value: 'LINKEDIN', label: 'From LinkedIn' },
  { value: 'INDEED', label: 'From Indeed' },
]

const sorts: Option[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'salary', label: 'Highest salary' },
]

export function JobFilters({
  categories,
  total,
}: {
  categories: { name: string; slug: string }[]
  total: number
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showAdvanced, setShowAdvanced] = useState(false)

  function update(next: Record<string, string>) {
    const search = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value) search.set(key, value)
      else search.delete(key)
    }
    search.delete('page') // any filter change resets pagination
    startTransition(() => {
      router.push(`/jobs?${search.toString()}`, { scroll: false })
    })
  }

  const activeCount = ['workMode', 'employment', 'experience', 'category', 'source', 'salaryMin']
    .filter((key) => params.get(key))
    .length

  return (
    <div className="space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const q = String(data.get('q') ?? '')
          const location = String(data.get('location') ?? '')
          track('job_search', { search_term: q, location, results: total })
          update({ q, location })
        }}
        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
        role="search"
      >
        <div>
          <label htmlFor="q" className="sr-only">
            Job title, skill or company
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={params.get('q') ?? ''}
            placeholder="Job title, skill or company"
            className={inputClass}
            enterKeyHint="search"
          />
        </div>
        <div>
          <label htmlFor="location" className="sr-only">
            City or country
          </label>
          <input
            id="location"
            name="location"
            type="search"
            defaultValue={params.get('location') ?? ''}
            placeholder="City or country"
            className={inputClass}
            enterKeyHint="search"
          />
        </div>
        <button
          type="submit"
          className="h-12 rounded-xl bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          disabled={isPending}
        >
          {isPending ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          aria-expanded={showAdvanced}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          Filters
          {activeCount ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs text-white">
              {activeCount}
            </span>
          ) : null}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort results
          </label>
          <select
            id="sort"
            className="h-10 rounded-xl border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={params.get('sort') ?? 'recent'}
            onChange={(event) => update({ sort: event.target.value })}
          >
            {sorts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={cn(
          'grid gap-2 sm:grid-cols-2 lg:grid-cols-3',
          showAdvanced ? 'grid' : 'hidden',
        )}
      >
        <Select
          label="Location type"
          value={params.get('workMode') ?? ''}
          options={workModes}
          onChange={(value) => update({ workMode: value })}
        />
        <Select
          label="Job type"
          value={params.get('employment') ?? ''}
          options={employments}
          onChange={(value) => update({ employment: value })}
        />
        <Select
          label="Experience"
          value={params.get('experience') ?? ''}
          options={experiences}
          onChange={(value) => update({ experience: value })}
        />
        <Select
          label="Category"
          value={params.get('category') ?? ''}
          options={[
            { value: '', label: 'All categories' },
            ...categories.map((category) => ({ value: category.slug, label: category.name })),
          ]}
          onChange={(value) => update({ category: value })}
        />
        <Select
          label="Source"
          value={params.get('source') ?? ''}
          options={sources}
          onChange={(value) => update({ source: value })}
        />
        <Select
          label="Minimum salary"
          value={params.get('salaryMin') ?? ''}
          options={[
            { value: '', label: 'Any salary' },
            { value: '30000', label: '30,000+' },
            { value: '60000', label: '60,000+' },
            { value: '90000', label: '90,000+' },
            { value: '120000', label: '120,000+' },
          ]}
          onChange={(value) => update({ salaryMin: value })}
        />
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
        {total.toLocaleString()} {total === 1 ? 'job' : 'jobs'} match your search
        {activeCount ? (
          <>
            {' · '}
            <button
              type="button"
              onClick={() =>
                update({
                  workMode: '',
                  employment: '',
                  experience: '',
                  category: '',
                  source: '',
                  salaryMin: '',
                })
              }
              className="font-medium text-brand-600 underline"
            >
              Clear filters
            </button>
          </>
        ) : null}
      </p>
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

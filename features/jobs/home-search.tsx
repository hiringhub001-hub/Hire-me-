'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HomeSearch() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        setPending(true)
        const data = new FormData(event.currentTarget)
        const params = new URLSearchParams()
        const q = String(data.get('q') ?? '').trim()
        const location = String(data.get('location') ?? '').trim()
        if (q) params.set('q', q)
        if (location) params.set('location', location)
        router.push(`/jobs${params.toString() ? `?${params}` : ''}`)
      }}
      className="mx-auto flex max-w-2xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row dark:border-slate-700 dark:bg-slate-900"
    >
      <label htmlFor="home-q" className="sr-only">
        Job title, skill or company
      </label>
      <input
        id="home-q"
        name="q"
        type="search"
        placeholder="Job title, skill or company"
        enterKeyHint="search"
        className="h-12 flex-1 rounded-xl bg-transparent px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
      />
      <div className="hidden w-px bg-slate-200 sm:block dark:bg-slate-700" aria-hidden />
      <label htmlFor="home-location" className="sr-only">
        City or country
      </label>
      <input
        id="home-location"
        name="location"
        type="search"
        placeholder="City or country"
        enterKeyHint="search"
        className="h-12 flex-1 rounded-xl bg-transparent px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
      >
        {pending ? 'Searching…' : 'Search jobs'}
      </button>
    </form>
  )
}

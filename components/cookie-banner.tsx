'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'cookie-consent'

/**
 * Consent notice. Analytics and personalised ads should only be enabled after
 * consent in regions that require it; the banner records the choice and
 * exposes it via the `hireme:consent` custom event for future tag gating.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // Storage blocked — do not nag the user on every page view.
    }
  }, [])

  function decide(choice: 'accepted' | 'rejected') {
    try {
      localStorage.setItem(STORAGE_KEY, choice)
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent('hireme:consent', { detail: choice }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-[72px] z-40 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:inset-x-auto lg:bottom-5 lg:right-5 lg:max-w-md dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        We use essential cookies to run the site and, with your permission, analytics and
        advertising cookies to keep it free. Read our{' '}
        <Link href="/cookies" className="font-medium text-brand-600 underline">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => decide('accepted')}
          className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide('rejected')}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Essential only
        </button>
      </div>
    </div>
  )
}

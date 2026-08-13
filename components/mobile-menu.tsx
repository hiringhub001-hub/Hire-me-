'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

const seekerMenu = [
  { href: '/jobs', label: 'Browse jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/career', label: 'Career advice' },
  { href: '/salary', label: 'Salary guides' },
  { href: '/interview', label: 'Interview guides' },
  { href: '/tools', label: 'Free tools' },
  { href: '/blog', label: 'Blog' },
  { href: '/job-alerts', label: 'Job alerts' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
]

const recruiterMenu = [
  { href: '/employer/post-job', label: 'Post a job' },
  { href: '/employer/jobs', label: 'Your jobs' },
  { href: '/employer/applications', label: 'Applicants' },
  { href: '/employer', label: 'Employer dashboard' },
  { href: '/jobs', label: 'Browse jobs' },
  { href: '/for-employers', label: 'How posting works' },
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
]

export function MobileMenu({ signedIn, role }: { signedIn: boolean; role: string | null }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // The drawer is portalled to <body>. It has to be: the site header uses
  // backdrop-blur, and a backdrop-filter establishes a containing block for
  // fixed-position descendants — so a drawer rendered inside the header would
  // size itself against the 64px header instead of the viewport, and its
  // off-screen box would widen the whole document.
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close the drawer when navigation happens.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const isRecruiter = role === 'EMPLOYER' || role === 'ADMIN'
  const isSeeker = role === 'CANDIDATE'
  const menu = isRecruiter ? recruiterMenu : seekerMenu
  const dashboardHref =
    role === 'ADMIN' ? '/admin' : role === 'EMPLOYER' ? '/employer' : '/dashboard'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {mounted
        ? createPortal(
            /* `overflow-hidden` is load-bearing: the drawer sits at
               translate-x-full while closed, and a transformed box extending
               past its container still counts towards the document's
               scrollable width. Without the clip the whole site gains a
               horizontal scrollbar on every screen below lg. */
            <div
              className={cn(
                'fixed inset-0 z-50 overflow-hidden lg:hidden',
                open ? 'pointer-events-auto' : 'pointer-events-none',
              )}
              aria-hidden={!open}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-slate-900/50 transition-opacity',
                  open ? 'opacity-100' : 'opacity-0',
                )}
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                className={cn(
                  'absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl transition-transform dark:bg-slate-950',
                  open ? 'translate-x-0' : 'translate-x-full',
                )}
              >
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {isRecruiter ? 'Recruiter menu' : 'Menu'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-2" aria-label="Mobile">
                  <ul>
                    {menu.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-xl px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="space-y-2 border-t border-slate-200 p-4 dark:border-slate-800">
                  {/* Posting is offered to recruiters only. Job seekers get a job
                search action instead, signed-out visitors the role chooser. */}
                  {isRecruiter ? (
                    <Link
                      href="/employer/post-job"
                      className="block rounded-xl bg-brand-600 px-4 py-3 text-center font-semibold text-white"
                    >
                      Post a job
                    </Link>
                  ) : isSeeker ? (
                    <Link
                      href="/jobs"
                      className="block rounded-xl bg-brand-600 px-4 py-3 text-center font-semibold text-white"
                    >
                      Find jobs
                    </Link>
                  ) : (
                    <Link
                      href="/get-started"
                      className="block rounded-xl bg-brand-600 px-4 py-3 text-center font-semibold text-white"
                    >
                      Get started
                    </Link>
                  )}

                  <Link
                    href={signedIn ? dashboardHref : '/signin'}
                    className="block rounded-xl border border-slate-300 px-4 py-3 text-center font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    {signedIn ? 'My dashboard' : 'Sign in'}
                  </Link>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

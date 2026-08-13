'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

type Item = { href: string; label: string; icon: string }

const seekerItems: Item[] = [
  { href: '/', label: 'Home', icon: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10' },
  { href: '/jobs', label: 'Jobs', icon: 'M4 7h16v13H4zM9 7V5h6v2M4 12h16' },
  {
    href: '/tools',
    label: 'Tools',
    icon: 'M14.5 4.5a4 4 0 0 1-5.2 5.2L5 14l5 5 4.3-4.3a4 4 0 0 1 5.2-5.2l-2.6 2.6-2.4-2.4z',
  },
  { href: '/career', label: 'Advice', icon: 'M4 5h16v12H8l-4 3z' },
  { href: '/dashboard', label: 'Me', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0' },
]

/** Recruiters get posting and applicant shortcuts instead of career tools. */
const recruiterItems: Item[] = [
  { href: '/employer', label: 'Home', icon: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10' },
  { href: '/employer/jobs', label: 'My jobs', icon: 'M4 7h16v13H4zM9 7V5h6v2M4 12h16' },
  { href: '/employer/post-job', label: 'Post', icon: 'M12 5v14M5 12h14' },
  {
    href: '/employer/applications',
    label: 'Applicants',
    icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0',
  },
  { href: '/jobs', label: 'Browse', icon: 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM20 20l-6-6' },
]

export function BottomNav({ role }: { role: string | null }) {
  const pathname = usePathname()
  const isRecruiter = role === 'EMPLOYER' || role === 'ADMIN'
  const items = isRecruiter ? recruiterItems : seekerItems

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active =
            item.href === '/' || item.href === '/employer'
              ? pathname === item.href
              : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px] font-medium leading-tight transition',
                  active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 dark:text-slate-400',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

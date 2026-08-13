import Link from 'next/link'

import { requireSession } from '@/lib/auth'
import { signOut } from '@/features/auth/actions'
import { SignOutButton } from '@/features/auth/forms'
import { Container, Section } from '@/components/ui'

const nav = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/saved', label: 'Saved jobs' },
  { href: '/dashboard/applications', label: 'Applications' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/tools/resume-builder', label: 'Resume builder' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession('/dashboard')

  return (
    <Section className="pt-6">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Hello, {session.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{session.email}</p>
          </div>
          <SignOutButton action={signOut} />
        </div>

        {/* Horizontally scrollable tabs work better than a sidebar on phones. */}
        <nav aria-label="Dashboard" className="mt-6 -mx-4 overflow-x-auto px-4">
          <ul className="flex min-w-max gap-1 border-b border-slate-200 dark:border-slate-800">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8">{children}</div>
      </Container>
    </Section>
  )
}

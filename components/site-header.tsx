import Image from 'next/image'
import Link from 'next/link'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { site } from '@/lib/site'
import { Container, buttonClass } from '@/components/ui'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileMenu } from '@/components/mobile-menu'

/** Links every visitor sees. */
const seekerNav = [
  { href: '/jobs', label: 'Jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/career', label: 'Career advice' },
  { href: '/salary', label: 'Salaries' },
  { href: '/interview', label: 'Interviews' },
  { href: '/tools', label: 'Free tools' },
]

/** Replaces the seeker links once you are signed in as a recruiter. */
const recruiterNav = [
  { href: '/employer/post-job', label: 'Post a job' },
  { href: '/employer/jobs', label: 'Your jobs' },
  { href: '/employer/applications', label: 'Applicants' },
  { href: '/jobs', label: 'Browse jobs' },
  { href: '/career', label: 'Career advice' },
]

export async function SiteHeader() {
  const session = await getSession()
  const isRecruiter = session?.role === 'EMPLOYER' || session?.role === 'ADMIN'
  const isSeeker = session?.role === 'CANDIDATE'
  const isAdmin = session?.role === 'ADMIN'

  // Admins get a badge showing how many listings are waiting on them, so the
  // moderation queue cannot quietly fill up unnoticed.
  const pendingCount = isAdmin
    ? await prisma.job.count({ where: { status: 'PENDING' } })
    : 0

  const nav = isRecruiter ? recruiterNav : seekerNav
  const dashboardHref =
    session?.role === 'ADMIN' ? '/admin' : session?.role === 'EMPLOYER' ? '/employer' : '/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <Container className="flex h-16 items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Image
            src={site.logo}
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="text-lg">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />

          {/* Only an admin session ever renders this. Everyone else has no link
              to /admin anywhere on the site, and the route redirects them. */}
          {isAdmin ? (
            <Link
              href="/admin"
              className={`${buttonClass({ variant: 'secondary', size: 'sm' })} gap-1.5`}
            >
              Admin
              {pendingCount > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-xs font-bold text-slate-900">
                  {pendingCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          {session ? (
            <Link href={dashboardHref} className={buttonClass({ variant: 'outline', size: 'sm' })}>
              {isRecruiter ? 'Dashboard' : 'My account'}
            </Link>
          ) : (
            <Link
              href="/signin"
              className={`${buttonClass({ variant: 'ghost', size: 'sm' })} hidden sm:inline-flex`}
            >
              Sign in
            </Link>
          )}

          {/* Job seekers are never shown a posting call to action. Recruiters get
              "Post a job"; signed-out visitors get the role chooser. */}
          {isSeeker ? (
            <Link
              href="/jobs"
              className={`${buttonClass({ size: 'sm' })} hidden sm:inline-flex`}
            >
              Find jobs
            </Link>
          ) : isRecruiter ? (
            <Link
              href="/employer/post-job"
              className={`${buttonClass({ size: 'sm' })} hidden sm:inline-flex`}
            >
              Post a job
            </Link>
          ) : (
            <Link
              href="/get-started"
              className={`${buttonClass({ size: 'sm' })} hidden sm:inline-flex`}
            >
              Get started
            </Link>
          )}

          <MobileMenu role={session?.role ?? null} signedIn={Boolean(session)} />
        </div>
      </Container>
    </header>
  )
}

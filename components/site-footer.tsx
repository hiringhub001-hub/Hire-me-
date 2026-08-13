import Link from 'next/link'

import { site } from '@/lib/site'
import { Container } from '@/components/ui'

type Column = { title: string; links: { href: string; label: string }[] }

const columns: Column[] = [
  {
    title: 'Find work',
    links: [
      { href: '/jobs', label: 'All jobs' },
      { href: '/jobs?workMode=REMOTE', label: 'Remote jobs' },
      { href: '/jobs?experience=ENTRY', label: 'Entry level jobs' },
      { href: '/jobs?employment=INTERNSHIP', label: 'Internships' },
      { href: '/companies', label: 'Companies hiring' },
      { href: '/job-alerts', label: 'Free job alerts' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/career', label: 'Career advice' },
      { href: '/salary', label: 'Salary guides' },
      { href: '/interview', label: 'Interview guides' },
      { href: '/blog', label: 'Blog' },
      { href: '/tools/resume-builder', label: 'Resume builder' },
      { href: '/tools/cover-letter-builder', label: 'Cover letter builder' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
      { href: '/editorial-policy', label: 'Editorial policy' },
      { href: '/careers', label: 'Careers at CareerHub' },
      { href: '/faq', label: 'FAQ' },
      { href: '/sitemap', label: 'Sitemap' },
    ],
  },
]

/** Only shown to recruiters and signed-out visitors — never to job seekers. */
const employerColumn: Column = {
  title: 'For employers',
  links: [
    { href: '/employer/post-job', label: 'Post a job' },
    { href: '/employer', label: 'Employer dashboard' },
    { href: '/signup?role=employer', label: 'Create recruiter account' },
    { href: '/for-employers', label: 'How it works' },
    { href: '/feeds/jobs.xml', label: 'Job feed for partners' },
  ],
}

const legal = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/disclaimer', label: 'Disclaimer' },
]

export function SiteFooter({ role }: { role: string | null }) {
  // A job seeker has no use for posting links, so they are removed rather than
  // shown and then blocked.
  const visibleColumns =
    role === 'CANDIDATE' ? columns : [...columns.slice(0, 2), employerColumn, ...columns.slice(2)]

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <Container className="py-12">
        <div
          className={`grid gap-10 sm:grid-cols-2 ${visibleColumns.length === 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}
        >
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white">
                HM
              </span>
              {site.name}
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {site.tagline}. Independent, free to use for job seekers, and written by people who
              have sat on both sides of the interview table.
            </p>
          </div>

          {visibleColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-brand-600 hover:underline dark:text-slate-400 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-600 hover:text-brand-600 hover:underline dark:text-slate-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} {site.name}. Job listings marked with a partner badge link
            to the employer&apos;s own application page on sites such as LinkedIn or Indeed. CareerHub
            is not affiliated with, endorsed by, or acting on behalf of those companies. We never
            charge job seekers, and we never ask for payment to apply for a role.
          </p>
        </div>
      </Container>
    </footer>
  )
}

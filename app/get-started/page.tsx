import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Container, Section } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Get started',
  description: `Join ${site.name} as a job seeker to search and apply for jobs, or as a recruiter to post vacancies and manage applicants.`,
  path: '/get-started',
})

export default async function GetStartedPage() {
  const session = await getSession()

  // Already signed in? There is nothing to choose — go where you belong.
  if (session) {
    redirect(
      session.role === 'ADMIN' ? '/admin' : session.role === 'EMPLOYER' ? '/employer' : '/dashboard',
    )
  }

  const [jobCount, companyCount] = await Promise.all([
    prisma.job.count({ where: { status: 'PUBLISHED' } }),
    prisma.company.count({ where: { approved: true } }),
  ])

  const options = [
    {
      href: '/signup?role=candidate',
      eyebrow: 'I am a job seeker',
      title: 'Find a job',
      body: `Search ${jobCount} open roles from ${companyCount} employers, apply in one place, and get the skills breakdown and interview preparation for every listing.`,
      points: [
        'Apply on CareerHub, or straight through to LinkedIn and Indeed listings',
        'Save jobs and track every application in one dashboard',
        'Free resume builder, cover letter builder and job match tool',
        'Email alerts when new matching roles are posted',
      ],
      cta: 'Create a job seeker account',
      tone: 'brand' as const,
    },
    {
      href: '/signup?role=employer',
      eyebrow: 'I am a recruiter',
      title: 'Hire someone',
      body: 'Post a vacancy in about ten minutes, or share one you already run on LinkedIn or Indeed. Review applicants and manage their status from one dashboard.',
      points: [
        'Free to post — every listing reviewed by a person before it goes live',
        'Applicants arrive having read the skills and interview guidance we attach',
        'Email alert the moment someone applies',
        'Share links to promote your job on LinkedIn, Indeed and WhatsApp',
      ],
      cta: 'Create a recruiter account',
      tone: 'slate' as const,
    },
  ]

  return (
    <Section>
      <Container className="max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            What brings you to {site.name}?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            Pick one and we will set your account up for it. Both are free, and you can browse jobs
            without an account at all.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 transition hover:border-brand-500 hover:shadow-lg focus-visible:border-brand-500 dark:border-slate-800 dark:bg-slate-900"
            >
              <p
                className={
                  option.tone === 'brand'
                    ? 'text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400'
                    : 'text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
                }
              >
                {option.eyebrow}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {option.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {option.body}
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {option.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M8.3 13.7 4.6 10l1.4-1.4 2.3 2.3 5.7-5.7L15.4 6.6z" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>

              <span className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-5 font-semibold text-white transition group-hover:bg-brand-700">
                {option.cta}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
            {' · '}
            Just looking?{' '}
            <Link href="/jobs" className="font-medium text-brand-600 hover:underline">
              Browse jobs without signing up
            </Link>
          </p>
        </div>
      </Container>
    </Section>
  )
}

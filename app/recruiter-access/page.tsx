import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { getSession } from '@/lib/auth'
import { enableRecruiterAccess } from '@/features/employer/access-actions'
import { Card, Container, Section, buttonClass } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Recruiter access',
  description: 'Add recruiter access to your CareerHub account to post jobs and manage applicants.',
  path: '/recruiter-access',
  noIndex: true,
})

/**
 * Where a signed-in job seeker lands if they open a recruiter URL. Posting is
 * genuinely unavailable to a job seeker account — but instead of an error, this
 * explains why and offers the one action that fixes it.
 */
export default async function RecruiterAccessPage() {
  const session = await getSession()
  if (!session) redirect('/signin?next=%2Femployer%2Fpost-job')
  if (session.role === 'EMPLOYER' || session.role === 'ADMIN') redirect('/employer')

  return (
    <Section>
      <Container className="max-w-2xl">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Recruiter access
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Your account is set up for job hunting
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            You are signed in as <strong>{session.email}</strong>, which is a job seeker account —
            that is why posting is not available. Job seeker accounts search and apply; recruiter
            accounts post vacancies and review applicants.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              If you are hiring, add recruiter access
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              This keeps the same login, saved jobs and application history. You will be able to
              post vacancies, see who applied and manage their status. It is free, and you can carry
              on using {site.name} to look for work as well.
            </p>
            <form action={enableRecruiterAccess} className="mt-4">
              <button type="submit" className={buttonClass()}>
                Add recruiter access
              </button>
            </form>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Landed here by mistake?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Nothing has changed on your account. Carry on with your search:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/jobs" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                Browse jobs
              </Link>
              <Link href="/dashboard" className={buttonClass({ variant: 'outline', size: 'sm' })}>
                My dashboard
              </Link>
              <Link
                href="/tools/resume-builder"
                className={buttonClass({ variant: 'outline', size: 'sm' })}
              >
                Resume builder
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </Section>
  )
}

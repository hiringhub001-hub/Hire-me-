import Link from 'next/link'
import type { Metadata } from 'next'

import { SignInForm } from '@/features/auth/forms'
import { GoogleButton } from '@/features/auth/google-button'
import { Alert, Card, Container, Section } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in to your CareerHub account to save jobs, track applications and manage alerts.',
  path: '/signin',
  noIndex: true,
})

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  // A Map, not an object literal. `error` comes straight from the query string,
  // so an object lookup also reaches Object.prototype: /signin?error=toString
  // returned a function, React was handed a function as a child, and the page
  // died with "Something went wrong" instead of ignoring an unknown code.
  const errors = new Map([
    ['google_failed', 'Google sign-in did not complete. Please try again.'],
    ['google_cancelled', 'Google sign-in was cancelled.'],
    ['google_unavailable', 'Google sign-in is not configured on this site yet.'],
    ['google_unverified', 'That Google account does not have a verified email address.'],
  ])
  const errorMessage = error ? errors.get(error) : undefined

  return (
    <Section>
      <Container className="max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Save jobs, track your applications and manage your alerts.
          </p>
          {errorMessage ? (
            <div className="mt-4">
              <Alert tone="error">{errorMessage}</Alert>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <GoogleButton next={next} label="Sign in with Google" />
            <SignInForm next={next} />
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            No account?{' '}
            <Link href="/signup" className="font-medium text-brand-600 hover:underline">
              Create one free
            </Link>
          </p>
        </Card>

        {/*
          Development only. These accounts exist solely when the seed is run
          with SEED_DEMO_CONTENT=true; on a live site the panel advertised three
          logins that do not exist, alongside a shared password — confusing at
          best, and an invitation to try password123 against real accounts.
        */}
        {process.env.NODE_ENV === 'development' ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            <p className="font-medium text-slate-800 dark:text-slate-200">Demo accounts</p>
            <p className="mt-1">
              candidate@careerhub.com.ng · employer@careerhub.com.ng · admin@careerhub.com.ng
              <br />
              Password for all three: <code className="font-mono">password123</code>
            </p>
            <p className="mt-2 text-xs">
              Created by <code className="font-mono">SEED_DEMO_CONTENT=true npm run db:seed</code>.
              This panel never renders in production.
            </p>
          </div>
        ) : null}
      </Container>
    </Section>
  )
}

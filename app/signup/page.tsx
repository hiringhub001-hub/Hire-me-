import Link from 'next/link'
import type { Metadata } from 'next'

import { SignUpForm } from '@/features/auth/forms'
import { GoogleButton } from '@/features/auth/google-button'
import { Card, Container, Section } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Create a free account',
  description:
    'Create a free CareerHub account to save jobs, track applications, set up job alerts and use the resume and cover letter builders.',
  path: '/signup',
})

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  const defaultRole = role === 'employer' ? 'EMPLOYER' : 'CANDIDATE'

  return (
    <Section>
      <Container className="max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Free, and free forever for job seekers. No card, no trial, no premium tier.
          </p>
          <div className="mt-6 space-y-4">
            <GoogleButton
              role={defaultRole === 'EMPLOYER' ? 'employer' : 'candidate'}
              label="Sign up with Google"
            />
            <SignUpForm defaultRole={defaultRole} />
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already registered?{' '}
            <Link href="/signin" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </Container>
    </Section>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'

import { SignInForm } from '@/features/auth/forms'
import { Card, Container, Section } from '@/components/ui'
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
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <Section>
      <Container className="max-w-md">
        <Card>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Save jobs, track your applications and manage your alerts.
          </p>
          <div className="mt-6">
            <SignInForm next={next} />
          </div>
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            No account?{' '}
            <Link href="/signup" className="font-medium text-brand-600 hover:underline">
              Create one free
            </Link>
          </p>
        </Card>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-200">Demo accounts</p>
          <p className="mt-1">
            candidate@careerhub.com.ng · employer@careerhub.com.ng · admin@careerhub.com.ng
            <br />
            Password for all three: <code className="font-mono">password123</code>
          </p>
        </div>
      </Container>
    </Section>
  )
}

'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { Container, Section, buttonClass } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Wire this to your error reporting service in production.
    console.error(error)
  }, [error])

  return (
    <Section>
      <Container className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          That is our fault, not yours. Try again — and if it keeps happening, tell us on the
          contact page and we will look into it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className={buttonClass()}>
            Try again
          </button>
          <Link href="/" className={buttonClass({ variant: 'outline' })}>
            Go home
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-4 text-xs text-slate-500">Reference: {error.digest}</p>
        ) : null}
      </Container>
    </Section>
  )
}

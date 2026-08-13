import Link from 'next/link'

import { ButtonLink, Container, Section } from '@/components/ui'

export default function NotFound() {
  return (
    <Section>
      <Container className="max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          We could not find that page
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Job listings are removed when they close or expire, so an old link may simply have run its
          course. Try a fresh search, or start from one of the sections below.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/jobs">Browse jobs</ButtonLink>
          <ButtonLink href="/career" variant="outline">
            Career advice
          </ButtonLink>
          <ButtonLink href="/tools" variant="outline">
            Free tools
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Or see the full{' '}
          <Link href="/sitemap" className="text-brand-600 hover:underline">
            sitemap
          </Link>
          .
        </p>
      </Container>
    </Section>
  )
}

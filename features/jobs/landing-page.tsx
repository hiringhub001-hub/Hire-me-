import Link from 'next/link'

import { JobCardList } from '@/features/jobs/job-card'
import type { JobCardData } from '@/features/jobs/queries'
import { AdSlot } from '@/components/ad-slot'
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  EmptyState,
  JsonLd,
  Section,
} from '@/components/ui'
import { breadcrumbJsonLd } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'

/**
 * Shared shell for the category and location landing pages.
 *
 * These exist so that "technology jobs" and "jobs in Nigeria" have a real,
 * crawlable URL instead of a `?category=` query string that robots.txt blocks.
 * Each one carries its own written introduction, so it is a page worth landing
 * on rather than a filtered view of another page.
 */
export function JobLandingPage({
  eyebrow,
  title,
  intro,
  body,
  crumbs,
  jobs,
  total,
  related,
}: {
  eyebrow: string
  title: string
  intro: string
  /** Paragraphs of original copy specific to this category or location. */
  body: string[]
  crumbs: { name: string; href: string }[]
  jobs: JobCardData[]
  total: number
  related: { href: string; label: string }[]
}) {
  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        {jobs.length ? (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: title,
              numberOfItems: jobs.length,
              itemListElement: jobs.map((job, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: absoluteUrl(`/jobs/${job.slug}`),
                name: job.title,
              })),
            }}
          />
        ) : null}

        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {intro}
          </p>
        </header>

        {jobs.length ? (
          <>
            <JobCardList jobs={jobs} />
            {total > jobs.length ? (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                Showing {jobs.length} of {total}.{' '}
                <Link href="/jobs" className="text-brand-600 hover:underline">
                  Search all jobs
                </Link>{' '}
                to filter further.
              </p>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="No open roles here right now"
            description="Nothing is live in this section at the moment. Set a free alert and we will email you the moment something matching is posted."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <ButtonLink href="/job-alerts">Create a job alert</ButtonLink>
                <ButtonLink href="/jobs" variant="outline">
                  Browse all jobs
                </ButtonLink>
              </div>
            }
          />
        )}

        <AdSlot placement="listing-footer" />

        <section className="mt-12 max-w-3xl border-t border-slate-200 pt-8 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            About {title.toLowerCase()}
          </h2>
          <div className="prose-content mt-3 text-base">
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {related.length ? (
            <>
              <h3 className="mt-8 font-semibold text-slate-900 dark:text-white">
                Useful reading before you apply
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {related.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-brand-600 hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </Container>
    </Section>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'

import { getSession } from '@/lib/auth'
import { JobAlertForm } from '@/features/site/forms'
import { Breadcrumbs, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Free job alerts',
  description:
    'Get new jobs matching your keywords and location by email, daily or weekly. Free, one-click unsubscribe, and we never pass your address to employers.',
  path: '/job-alerts',
})

export default async function JobAlertsPage() {
  const session = await getSession()
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Job alerts', href: '/job-alerts' },
  ]

  return (
    <Section className="pt-6">
      <Container className="max-w-3xl">
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title="Free job alerts"
          intro="New roles matching your search, emailed to you. Free, no account required, and one click to stop."
        />

        <Card>
          <JobAlertForm defaultEmail={session?.email} />
        </Card>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            How to set an alert that is actually useful
          </h2>
          <div className="prose-content mt-3 text-base">
            <p>
              The most common mistake is setting one broad alert and then ignoring it because
              nine-tenths of what arrives is irrelevant. Two or three narrow alerts beat one wide
              one, and they take the same amount of time to create.
            </p>
            <h3>Search by skill, not only by title</h3>
            <p>
              Job titles are inconsistent between employers — the same work is advertised as
              Support Analyst, Customer Success Associate and Service Desk Technician. Skills are
              more stable. An alert on a skill you actually have will surface roles that a title
              search never reaches.
            </p>
            <h3>Set the frequency to match your search</h3>
            <p>
              If you are searching actively, take the daily alert: in a competitive market,
              applying within the first few days measurably improves your odds, because reviewers
              read the earliest applications when the pile is smallest. If you are keeping an eye
              out while employed, weekly is less intrusive and easier to sustain for months.
            </p>
            <h3>Review your alerts monthly</h3>
            <p>
              Searches drift. If an alert stops producing anything you would apply for, widen the
              location or drop one keyword rather than letting it become noise you skim past.
            </p>
            <p>
              While you wait for matches, our{' '}
              <Link href="/career/how-to-write-a-resume">CV guide</Link> and{' '}
              <Link href="/tools/job-match">job match tool</Link> are the highest-value things you
              can do with an hour.
            </p>
          </div>
        </section>
      </Container>
    </Section>
  )
}

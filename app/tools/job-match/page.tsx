import Link from 'next/link'
import type { Metadata } from 'next'

import { JobMatch } from '@/features/tools/job-match'
import { Breadcrumbs, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Job match score and skill gap check',
  description:
    'Paste a job advert and your skills to see which requirements you match, which terms the employer used that you did not, and what to emphasise in your application.',
  path: '/tools/job-match',
})

export default function JobMatchPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Free tools', href: '/tools' },
    { name: 'Job match score', href: '/tools/job-match' },
  ]

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        <PageHeader
          title="Job match score"
          intro="See how your skills line up against a specific advert, and which of the employer's own terms are missing from your application. Everything runs in your browser."
        />

        <JobMatch />

        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            How to read your score
          </h2>
          <div className="prose-content mt-3 text-base">
            <p>
              This tool compares the words you used against the words the employer used. That
              sounds crude, and it is deliberate: it is roughly what a recruiter searching an
              applicant tracking system does, so it shows you the same blind spots they would hit.
            </p>
            <p>
              A low score does not mean you cannot do the job. More often it means you and the
              employer describe the same work differently — you wrote &ldquo;customer
              invoicing&rdquo; and they wrote &ldquo;accounts receivable&rdquo;. Adopting their
              vocabulary, where it is honestly true of you, is the single fastest improvement you
              can make to an application.
            </p>
            <h3>What the score is not</h3>
            <ul>
              <li>
                It is not a prediction of whether you will be hired. Interviews assess judgement and
                collaboration, which no keyword comparison can see.
              </li>
              <li>
                It does not weight requirements. An advert&apos;s first requirement usually matters
                far more than its eighth.
              </li>
              <li>
                It cannot tell whether you meet a hard gate — a licence, a registration, the right
                to work. Check those yourself before applying.
              </li>
            </ul>
            <p>
              A useful benchmark: if you match around 70% of the essential requirements, apply. Very
              few candidates match every line of a job advert, and employers do not expect them to.
            </p>
            <p>
              Next steps: <Link href="/tools/resume-builder">build the CV</Link> around your matched
              skills, then use the{' '}
              <Link href="/tools/cover-letter-builder">cover letter builder</Link> to turn your
              strongest match into a specific example.
            </p>
          </div>
        </section>
      </Container>
    </Section>
  )
}

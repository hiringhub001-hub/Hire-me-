import Link from 'next/link'
import type { Metadata } from 'next'

import { ResumeBuilder } from '@/features/tools/resume-builder'
import { Breadcrumbs, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Free resume builder',
  description:
    'Build an ATS-friendly CV in your browser. Single-column layout, standard section headings, and prompts that push you towards results instead of duty statements. Free, no account, no watermark.',
  path: '/tools/resume-builder',
})

export default function ResumeBuilderPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Free tools', href: '/tools' },
    { name: 'Resume builder', href: '/tools/resume-builder' },
  ]

  return (
    <Section className="pt-6">
      <Container>
        <div className="print:hidden">
          <Breadcrumbs crumbs={crumbs} />
          <JsonLd data={breadcrumbJsonLd(crumbs)} />
          <PageHeader
            title="Resume builder"
            intro="A single-column CV in the layout that applicant tracking systems parse most reliably. Everything you type stays in your browser — nothing is uploaded. Use your browser's print dialog to save as PDF."
          />
        </div>

        <ResumeBuilder />

        <section className="mt-16 max-w-3xl print:hidden">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Why this layout, and not a designed template
          </h2>
          <div className="prose-content mt-3 text-base">
            <p>
              Two-column CVs with sidebars look good on screen and frequently parse badly. When an
              applicant tracking system flattens a two-column layout into text, the columns
              interleave — your job titles end up mixed with your skills list, and the recruiter
              searching the database never finds you. A single column avoids that entirely.
            </p>
            <p>
              The section headings here are deliberately plain: Summary, Experience, Skills,
              Education. Parsers look for exactly these strings. Creative headings such as &ldquo;My
              journey&rdquo; confuse the software and help no human either.
            </p>
            <h3>Getting the most out of it</h3>
            <ul>
              <li>
                Write bullets that start with a verb and end with a number. &ldquo;Managed
                reporting&rdquo; tells a hiring manager nothing; &ldquo;Rebuilt weekly reporting for
                12 branches, cutting preparation from 6 hours to 40 minutes&rdquo; tells them your
                scale and your standard.
              </li>
              <li>
                Keep it to one page under five years of experience, two pages beyond that.
              </li>
              <li>
                Put your three most relevant bullets at the top of your most recent role, and
                reorder them for each application rather than rewriting the CV.
              </li>
              <li>
                Leave off your photo, date of birth and full street address unless the norm in your
                country requires them.
              </li>
            </ul>
            <p>
              The full method is in our{' '}
              <Link href="/career/how-to-write-a-resume">guide to writing a resume</Link>, and{' '}
              <Link href="/blog/ats-friendly-cv-formatting">
                what actually matters in ATS formatting
              </Link>{' '}
              separates the real rules from the myths.
            </p>
          </div>
        </section>
      </Container>
    </Section>
  )
}

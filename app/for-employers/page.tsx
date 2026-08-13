import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs, ButtonLink, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'For employers',
  description:
    'How posting on CareerHub works: free listings, review before publication, and a full job page with an independent skills breakdown and interview guidance attached.',
  path: '/for-employers',
})

export default function ForEmployersPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'For employers', href: '/for-employers' },
  ]

  return (
    <Section className="pt-6">
      <Container className="max-w-3xl">
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title="Hiring on CareerHub"
          intro="Post a role directly, or share one you have already advertised on LinkedIn or Indeed. Either way it gets a full page here with our own analysis attached."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Post or link',
              body: 'Fill in the form, or paste the URL of a listing you already run on another board. Takes about ten minutes.',
            },
            {
              step: '2',
              title: 'We review it',
              body: 'A person checks every listing before it publishes — usually within a few hours on working days.',
            },
            {
              step: '3',
              title: 'Candidates arrive prepared',
              body: 'Applicants have read the skills breakdown and interview guidance on your job page before they apply.',
            },
          ].map((item) => (
            <Card key={item.step}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                {item.step}
              </span>
              <h2 className="mt-3 font-semibold text-slate-900 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.body}
              </p>
            </Card>
          ))}
        </div>

        <div className="prose-content mt-10">
          <h2>What it costs</h2>
          <p>
            Standard listings are free while we build the candidate base. Promoted placement will be
            a paid option later; standard posting will stay free. There is no contract and no sales
            call.
          </p>

          <h2>Why we review every listing</h2>
          <p>
            Recruitment fraud is the single biggest problem in online job search, and unmoderated
            boards are where it lives. Reviewing before publication costs us time and costs you a
            few hours&apos; delay. It is the reason candidates trust what they find here, which is
            ultimately what makes your listing worth posting.
          </p>
          <p>We reject listings that:</p>
          <ul>
            <li>ask candidates for payment at any stage, for any reason;</li>
            <li>do not name the employer, or misrepresent who the employer is;</li>
            <li>request bank details or identity documents before a written offer;</li>
            <li>describe work we cannot verify exists;</li>
            <li>are too thin to build a useful candidate-facing page from.</li>
          </ul>

          <h2>Getting better applications</h2>
          <ul>
            <li>
              <strong>Publish a salary range.</strong> It is the single largest factor in
              application volume, typically around double, and it filters out mismatches early.
            </li>
            <li>
              <strong>Be honest about which requirements are essential.</strong> Long
              &ldquo;essential&rdquo; lists deter exactly the candidates who would have been good.
            </li>
            <li>
              <strong>State the working arrangement precisely.</strong> &ldquo;Hybrid&rdquo; means
              nothing without a number of days.
            </li>
            <li>
              <strong>Put the day-one priority first.</strong> Candidates read the first
              responsibility as the job and prepare accordingly.
            </li>
            <li>
              <strong>Reply to everyone.</strong> It costs one templated email and it is the thing
              candidates remember about your brand.
            </li>
          </ul>

          <h2>What we will not do</h2>
          <p>
            We will not let you buy a more favourable write-up. The analysis on your job page is
            independent, written by our editorial team, and not shown to you for approval. Featured
            listings are labelled as featured. Our{' '}
            <Link href="/editorial-policy">editorial policy</Link> sets out the boundary in full.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          <ButtonLink href="/employer/post-job" size="lg">
            Post a job
          </ButtonLink>
          <ButtonLink href="/signup?role=employer" variant="outline" size="lg">
            Create an employer account
          </ButtonLink>
        </div>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Questions? Email{' '}
          <a href={`mailto:${site.email}`} className="text-brand-600 hover:underline">
            {site.email}
          </a>
          .
        </p>
      </Container>
    </Section>
  )
}

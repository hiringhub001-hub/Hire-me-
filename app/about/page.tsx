import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'About us',
  description:
    'Who runs CareerHub, why we built it, how we make money, and the editorial standards we hold ourselves to.',
  path: '/about',
})

const team = [
  {
    name: 'Dana Okoye',
    role: 'Editorial lead',
    bio: 'Eleven years as an in-house recruiter across technology and operations, latterly running hiring for a 300-person company. Writes most of our CV and job search guidance.',
  },
  {
    name: 'Marcus Lin',
    role: 'Compensation',
    bio: 'Compensation consultant. Builds and reviews our salary guides, and has spent a decade telling people that their offer has more room in it than they think.',
  },
  {
    name: 'Priya Raman',
    role: 'Career coaching',
    bio: 'Career coach specialising in career changers and people returning to work after a break. Writes our career growth and transition material.',
  },
  {
    name: 'Sam Ferreira',
    role: 'Technical interviews',
    bio: 'Engineering manager who has run several hundred technical interviews. Writes our technical interview guides and reviews the skills breakdowns.',
  },
]

export default function AboutPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
  ]

  return (
    <Section className="pt-6">
      <Container className="max-w-3xl">
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title={`About ${site.name}`}
          intro="We are a small team of recruiters, hiring managers and career coaches building the job site we wanted when we were on the other side of the process."
        />

        <div className="prose-content">
          <h2>Why we built this</h2>
          <p>
            Job boards have a structural problem: they are paid by employers, so they optimise for
            listings rather than for outcomes. The result is millions of pages that reprint a job
            advert, add nothing, and leave the candidate to work out for themselves what the role
            involves, what it should pay, and how the interview will go.
          </p>
          <p>
            We think the useful thing sits around the listing rather than in it. So every job page
            here carries our own analysis: what the role actually involves, which of the listed
            skills will genuinely be tested and how, what the pay looks like in context, where the
            role leads, and what to prepare. That work is done by people who have run hiring
            processes, not generated from the advert text.
          </p>

          <h2>What we do differently</h2>
          <ul>
            <li>
              <strong>One place to search, wherever the job lives.</strong> We list roles posted
              directly with us alongside listings from LinkedIn, Indeed and other boards. Partner
              listings are badged clearly and send you to the employer&apos;s own application page —
              we never pretend to own an application we do not handle.
            </li>
            <li>
              <strong>Original guidance on every page.</strong> No page here exists solely to
              reprint someone else&apos;s advert.
            </li>
            <li>
              <strong>Free, permanently, for job seekers.</strong> No premium tier, no paywalled
              guides, no export fee on the CV builder.
            </li>
            <li>
              <strong>Listings are reviewed before publication.</strong> We reject anything that
              asks candidates for money, conceals the employer, or is too thin to build a useful
              page from.
            </li>
          </ul>

          <h2>How we make money</h2>
          <p>
            Two ways, both disclosed. Advertising placed around our editorial content, and — in
            future — optional paid promotion for employers who want a listing featured. Neither
            affects our editorial judgement: a featured listing is labelled as featured, and paying
            for one does not buy a more favourable write-up. Advertising never appears inside an
            application form or beside an apply button.
          </p>
          <p>
            We do not sell candidate data, and we do not take a fee from job seekers at any point.
          </p>

          <h2>Our standards</h2>
          <p>
            Everything we publish is written by a named author with relevant working experience, and
            reviewed before it goes live. When we get something wrong we correct it and say so. Our{' '}
            <Link href="/editorial-policy">editorial policy</Link> sets out how we source, review
            and update material, and how to tell us about an error.
          </p>
        </div>

        <h2 className="mt-12 text-xl font-bold text-slate-900 dark:text-white">Who writes here</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {team.map((member) => (
            <Card key={member.name}>
              <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-brand-600 dark:text-brand-400">{member.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {member.bio}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Get in touch</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Editorial questions and corrections:{' '}
            <a href={`mailto:${site.editorialEmail}`} className="text-brand-600 hover:underline">
              {site.editorialEmail}
            </a>
            . Everything else:{' '}
            <a href={`mailto:${site.email}`} className="text-brand-600 hover:underline">
              {site.email}
            </a>{' '}
            or the{' '}
            <Link href="/contact" className="text-brand-600 hover:underline">
              contact form
            </Link>
            .
          </p>
        </div>
      </Container>
    </Section>
  )
}

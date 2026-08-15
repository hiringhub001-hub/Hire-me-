import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: `Careers at ${site.name}`,
  description: `How we work at ${site.name}, what we look for, and how to approach us about a role even when nothing is advertised.`,
  path: '/careers',
})

/**
 * Not vacancies. Nothing here is an advertised opening with a live process
 * behind it, and presenting it as one would be a job advert for a job that does
 * not exist — on a job board, of all places.
 */
const interests = [
  {
    title: 'Editorial contributors',
    detail:
      'We commission guides from people currently working in hiring: recruiters, hiring managers, compensation specialists and coaches. Paid per commissioned piece. You need direct working experience of the subject — we do not commission general writers.',
  },
  {
    title: 'Moderation and listing review',
    detail:
      'Reviewing employer accounts and job listings before publication, and investigating reports of fraudulent listings. Recruitment or trust-and-safety experience helps.',
  },
]

export default function CareersPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Careers', href: '/careers' },
  ]

  return (
    <Section className="pt-6">
      <Container className="max-w-3xl">
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title={`Careers at ${site.name}`}
          intro="We are small and we hire rarely. There are no vacancies open at the moment — this page explains how we work and the kinds of help we take on when we do."
        />

        <div className="prose-content">
          <h2>How we work</h2>
          <ul>
            <li>Remote-first, with a four-hour overlap requirement and no core-hours theatre beyond it.</li>
            <li>
              Written-first. Proposals are documented before meetings, and most decisions never need
              a meeting at all.
            </li>
            <li>
              We publish our salary bands internally and we state a range in every advert we post,
              because we would find it hard to write what we write and then do otherwise.
            </li>
            <li>
              Small scope, real ownership. Nobody here is three layers from the work.
            </li>
          </ul>

          <h2>What we look for</h2>
          <p>
            Direct experience of the thing you would be doing, evidence you can write clearly, and a
            demonstrated willingness to be told you are wrong. We interview in two conversations and
            a paid piece of real work, and we tell every applicant the outcome — the standard we
            spend a lot of words asking employers to meet.
          </p>
        </div>

        <h2 className="mt-12 text-xl font-bold text-slate-900 dark:text-white">
          Where we take on help
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We have no vacancies advertised right now. These are the two areas we bring people in on
          when we do, so you can judge whether it is worth writing to us.
        </p>
        <div className="mt-4 space-y-4">
          {interests.map((interest) => (
            <Card key={interest.title}>
              <h3 className="font-semibold text-slate-900 dark:text-white">{interest.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {interest.detail}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Approaching us anyway</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            If one of those fits, or you think you should work with us anyway, write to us through the{' '}
            <Link href="/contact" className="text-brand-600 hover:underline">
              contact form
            </Link>{' '}
            with one paragraph on what you would work on and one example of relevant work. That is
            the same advice we give candidates approaching any small employer, and it works.
          </p>
        </div>
      </Container>
    </Section>
  )
}

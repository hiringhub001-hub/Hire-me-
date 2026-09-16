import type { Metadata } from 'next'

import { ContactForm } from '@/features/site/forms'
import { Breadcrumbs, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Contact us',
  description:
    'Contact the CareerHub team about a job listing, a correction to a guide, an employer account, a data request, or to report a fraudulent listing.',
  path: '/contact',
})

export default function ContactPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <Section className="pt-6">
      <Container className="max-w-3xl">
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title="Contact us"
          intro="A person reads every message. We reply within two working days, and the same day for reports of fraudulent listings."
        />

        {/*
          A contact page that is only a form is one of the thinner things a site
          can publish, and it is one of the pages a reviewer opens first. Saying
          what happens after you press send is more useful than the form itself.
        */}
        <div className="prose-content mb-8 max-w-3xl">
          <h2>What to expect when you write to us</h2>
          <p>
            Every message is read by a person. General enquiries are answered within two working
            days. Reports of fraudulent listings are handled the same day, because a scam advert
            left up for a weekend does real damage.
          </p>
          <p>
            If you are writing about a specific job, include the page address. It saves a round
            trip, and it lets us check the listing against what the employer originally submitted.
          </p>

          <h2>The things we are asked most</h2>
          <p>
            <strong>A job on the site looks fake.</strong> Tell us and we will investigate that day.
            We remove anything that asks a candidate for money, hides the employer&apos;s identity,
            or moves the conversation to a messaging app before an interview. You do not need to be
            certain — a suspicion is enough for us to look.
          </p>
          <p>
            <strong>I applied and heard nothing.</strong> We pass applications to the employer and
            confirm by email that yours was sent, but we cannot make an employer reply, and we have
            no visibility of their decision. If you applied on a partner site through a link here,
            your application never touched our systems and the employer is the only one who can help.
          </p>
          <p>
            <strong>Something in a guide is wrong or out of date.</strong> Write to the editorial
            address with the page and what you think is wrong. Corrections from readers have
            improved several of these guides, and we would rather be corrected than confident.
          </p>
          <p>
            <strong>I want my data removed.</strong> Use the privacy address and say which account
            or application it concerns. We will confirm what we hold and remove it.
          </p>
          <p>
            <strong>I want to advertise a role.</strong> You can post one yourself from the employer
            area. Every listing is reviewed by a person before it goes live, which usually takes a
            few hours rather than days.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
          <Card>
            <ContactForm />
          </Card>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-5 text-sm dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-white">Direct email</h2>
              <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  General: <a href={`mailto:${site.email}`} className="text-brand-600 hover:underline">{site.email}</a>
                </li>
                <li>
                  Support: <a href={`mailto:${site.supportEmail}`} className="text-brand-600 hover:underline">{site.supportEmail}</a>
                </li>
                <li>
                  Employers and job listings:{' '}
                  <a href={`mailto:${site.jobsEmail}`} className="text-brand-600 hover:underline">
                    {site.jobsEmail}
                  </a>
                </li>
                <li>
                  Privacy and data requests:{' '}
                  <a href={`mailto:${site.privacyEmail}`} className="text-brand-600 hover:underline">
                    {site.privacyEmail}
                  </a>
                </li>
                <li>
                  Corrections: <a href={`mailto:${site.editorialEmail}`} className="text-brand-600 hover:underline">{site.editorialEmail}</a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm dark:border-red-900 dark:bg-red-950/40">
              <h2 className="font-semibold text-red-900 dark:text-red-200">
                Reporting a scam listing
              </h2>
              <p className="mt-2 leading-relaxed text-red-800 dark:text-red-300">
                Include the job URL and what happened. We investigate the same day and remove
                anything that asks candidates for money or hides the employer&apos;s identity.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 text-sm dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-white">Where we are</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{site.address}</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

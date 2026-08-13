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

import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Frequently asked questions',
  description:
    'Answers to common questions about applying through CareerHub, partner listings from LinkedIn and Indeed, job alerts, employer accounts and data privacy.',
  path: '/faq',
})

const groups = [
  {
    title: 'For job seekers',
    faqs: [
      {
        question: `Is ${site.name} free?`,
        answer:
          'Yes, completely, for job seekers. There is no premium tier, no paywalled guidance and no export fee on the tools. We are funded by advertising and, in future, optional promoted listings paid for by employers.',
      },
      {
        question: 'Do I need an account to apply?',
        answer:
          'No. You can apply to any direct listing without signing up. An account is only needed if you want to save jobs, track your applications and have your details pre-filled.',
      },
      {
        question: 'Why do some jobs send me to LinkedIn or Indeed?',
        answer:
          'Because that is where the employer is taking applications. We aggregate listings so you can search everything in one place, but we never intercept an application the employer wants to receive elsewhere. Those listings carry a badge showing their source, and the Apply button opens the employer’s own page there. You can still save the job here to track it.',
      },
      {
        question: 'Will the employer see that I came from here?',
        answer:
          'For direct listings, your application arrives in the employer’s CareerHub dashboard, so yes. For partner listings you are applying on that platform, and what the employer sees is determined by them, not by us.',
      },
      {
        question: 'How do job alerts work?',
        answer:
          'Tell us the keywords and location you care about and how often you want to hear from us. We email matching new roles daily or weekly. Every email has a one-click unsubscribe, and we never pass your address to employers or advertisers.',
      },
      {
        question: 'What if I find a fraudulent listing?',
        answer:
          'Report it through the contact page and we will investigate the same day. We remove any listing that asks candidates for payment, conceals the employer’s identity, or requests bank or identity documents before a written offer. Our guide on spotting job scams explains the warning signs.',
      },
      {
        question: 'Can I delete my account and data?',
        answer:
          'Yes. Email us and we will delete your account and associated data. Applications you already sent to an employer are held by that employer under their own privacy policy, so ask them directly for those.',
      },
    ],
  },
  {
    title: 'For employers',
    faqs: [
      {
        question: 'How much does it cost to post a job?',
        answer:
          'Posting is currently free while we build the candidate base. Optional promoted listings will be a paid feature later; posting a standard listing will remain free.',
      },
      {
        question: 'How long does review take?',
        answer:
          'Usually a few hours during business days. Every listing is checked before publication — that is what keeps the quality of applications high and the fraudulent listings out.',
      },
      {
        question: 'Why was my listing rejected?',
        answer:
          'The common reasons are: asking candidates for payment, not naming the employer, a description too thin to build a useful page from, or a role we could not verify exists. We usually explain the reason, and you are welcome to revise and resubmit.',
      },
      {
        question: 'Can I post a job I have already advertised on LinkedIn?',
        answer:
          'Yes, and it is a normal thing to do. Choose LinkedIn as the source and paste the application URL. Candidates apply on LinkedIn as usual, and your role gets a full page here with our own skills breakdown and interview guidance attached. You can also accept CareerHub applications alongside it.',
      },
      {
        question: 'Can I pay for a better write-up?',
        answer:
          'No. Featured placement is a paid option and is labelled as featured. The editorial analysis on your job page is written independently and is not for sale.',
      },
    ],
  },
]

export default function FaqPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'FAQ', href: '/faq' },
  ]
  const allFaqs = groups.flatMap((group) => group.faqs)

  return (
    <Section className="pt-6">
      <Container className="max-w-3xl">
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        <JsonLd data={faqJsonLd(allFaqs)} />

        <PageHeader
          title="Frequently asked questions"
          intro="If the answer you need is not here, the contact form goes straight to a person."
        />

        {groups.map((group) => (
          <section key={group.title} className="mt-10 first:mt-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{group.title}</h2>
            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
              {group.faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-slate-900 dark:text-white">
                    {faq.question}
                    <span className="text-slate-400 transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-12 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">Still stuck?</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/contact" className="text-brand-600 hover:underline">
              Send us a message
            </Link>{' '}
            — we reply to everything within two working days.
          </p>
        </div>
      </Container>
    </Section>
  )
}

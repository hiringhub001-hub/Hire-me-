import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Disclaimer',
  description:
    'The limits of the information published on CareerHub: general guidance, not personalised career, legal, financial or immigration advice.',
  path: '/disclaimer',
})

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      href="/disclaimer"
      intro={`What you can and cannot rely on ${site.name} for.`}
      sections={[
        {
          heading: 'General information only',
          body: [
            'Everything published here is general guidance based on the working experience of our authors. It is not personalised career, legal, financial, tax or immigration advice, and it cannot account for your specific circumstances.',
            'Where a decision has legal or financial consequences — an employment contract, a visa route, a redundancy settlement, a pension transfer — take professional advice from someone qualified in your jurisdiction.',
          ],
        },
        {
          heading: 'Salary figures',
          body: [
            'Salary ranges are compiled from advertised bands, published pay scales and industry surveys. They are estimates that age quickly and vary enormously by employer, city and individual scope. Treat them as a starting point for a conversation, not a valuation of your work or a promise of what you will be offered.',
          ],
        },
        {
          heading: 'Job listings',
          body: [
            'Listings are supplied by employers or sourced from partner job boards. We review listings before publication and remove those that break our rules, but we cannot independently verify every claim an employer makes about pay, conditions or the role itself.',
            'Verify the employer and the terms before accepting any offer. We never ask job seekers for payment, and no legitimate employer will either — read our guide to spotting job scams if anything feels wrong.',
          ],
        },
        {
          heading: 'External links',
          body: [
            'We link to third-party sites, including LinkedIn, Indeed and employer careers pages. We do not control their content, availability or practices, and a link is not an endorsement. Their terms and privacy policies apply once you leave this site.',
          ],
        },
        {
          heading: 'No guarantee of outcome',
          body: [
            'Following the guidance on this site improves how you present yourself. It does not guarantee interviews, offers or employment, and anyone promising otherwise should be treated with suspicion.',
          ],
        },
      ]}
    />
  )
}

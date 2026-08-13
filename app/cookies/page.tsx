import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Policy',
  description:
    'Every cookie CareerHub sets, what it does, how long it lasts, and how to change your choices in the banner or your browser.',
  path: '/cookies',
})

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      href="/cookies"
      intro="This page lists the cookies and similar technologies used on this site, what each one is for, and how to change your mind."
      sections={[
        {
          heading: 'What cookies are',
          body: [
            'A cookie is a small text file a website stores on your device. It lets the site remember something between page loads — that you are signed in, for example, or that you have already dismissed a notice.',
            'We keep the number of cookies deliberately small. Nothing beyond the essential ones is set unless you consent.',
          ],
        },
        {
          heading: 'Essential cookies',
          body: [
            'These are required for the site to function and cannot be turned off. They do not track you across other websites.',
          ],
          bullets: [
            'hireme_session — keeps you signed in. HTTP-only, so scripts cannot read it, and same-site, so other websites cannot cause it to be sent. Expires after 30 days.',
            'cookie-consent — stored in your browser rather than sent to us, and records whether you accepted analytics and advertising cookies so we do not ask again.',
            'theme — remembers whether you chose light or dark mode. Also stored locally in your browser.',
          ],
        },
        {
          heading: 'Analytics cookies',
          body: [
            'Set only if you accept them. We use Google Analytics 4 and Microsoft Clarity to understand which pages are useful and where people get stuck. IP addresses are anonymised. We do not use analytics data to identify individuals.',
          ],
          bullets: [
            '_ga and _ga_* — Google Analytics, used to distinguish sessions. Up to 24 months.',
            '_clck and _clsk — Microsoft Clarity, used for aggregate interaction analysis. Up to 12 months.',
          ],
        },
        {
          heading: 'Advertising cookies',
          body: [
            'Set only if you accept them, and only once advertising is enabled on the site. Advertising is what keeps the service free for job seekers.',
            'Google, as a third-party vendor, uses cookies to serve ads on this site. Its use of advertising cookies enables it and its partners to serve ads based on your visit here and to other sites. You can opt out of personalised advertising in Google Ads Settings, and out of third-party vendor cookies at aboutads.info.',
          ],
        },
        {
          heading: 'Changing your choice',
          steps: [
            'Clear this site’s data in your browser settings, then reload the page. The consent banner will appear again and you can choose differently.',
            'Or block cookies for this site entirely in your browser. Essential cookies will be blocked too, which means you will not be able to stay signed in.',
            'You can also use your browser’s private or incognito mode, which discards all cookies when you close the window.',
          ],
        },
        {
          heading: 'Do Not Track',
          body: [
            'There is still no agreed industry standard for responding to Do Not Track browser signals. Where your browser sends a Global Privacy Control signal and your local law requires us to honour it, we treat it as a withdrawal of consent to analytics and advertising cookies.',
          ],
        },
      ]}
    />
  )
}

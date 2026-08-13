import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'How CareerHub collects, uses, shares and protects your personal data, what cookies and advertising partners we use, and how to exercise your data rights.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      href="/privacy"
      intro={`This policy explains what personal data ${site.name} collects, why we collect it, who we share it with, and the choices you have. It applies to this website and any related services we operate.`}
      sections={[
        {
          heading: 'Who we are',
          body: [
            `${site.name} is a career resource website and job board operated from ${site.address}. For the purposes of data protection law we are the data controller for the personal data described in this policy. Data protection questions go to ${site.privacyEmail}; anything else to ${site.email}.`,
          ],
        },
        {
          heading: 'What we collect',
          body: ['We collect three categories of data, and no more than we need for each purpose.'],
          bullets: [
            'Account data — your name, email address and password (stored only as a cryptographic hash, never in readable form). If you choose to complete your profile we also store your headline, location, phone number, skills and any CV link you add.',
            'Application data — when you apply for a job through this site: your name, email, phone number, CV link and the cover letter you write. This is shared with the employer you applied to.',
            'Technical and usage data — IP address, browser type, pages visited and referring page. This is used to keep the service secure, to prevent abuse, and to understand which pages are useful.',
          ],
        },
        {
          heading: 'What we do not collect',
          bullets: [
            'We do not ask for or store payment details from job seekers. The service is free and always will be.',
            'We do not require identity documents, national insurance or social security numbers, or bank details. No legitimate employer needs these before a written offer, and we will never ask for them on their behalf.',
            'We do not sell personal data to anyone, for any purpose.',
          ],
        },
        {
          heading: 'Why we process your data, and our legal basis',
          bullets: [
            'To provide the service you asked for — creating your account, saving jobs, submitting applications. Legal basis: performance of a contract with you.',
            'To send job alerts you have subscribed to. Legal basis: your consent, which you can withdraw at any time from any alert email.',
            'To keep the site secure, prevent fraudulent listings and enforce our terms. Legal basis: our legitimate interests in operating a safe service.',
            'To measure how the site is used, with analytics. Legal basis: your consent where required by your local law.',
            'To show advertising that funds the free service. Legal basis: your consent where required.',
          ],
        },
        {
          heading: 'Who we share data with',
          body: [
            'When you apply for a job through this site, your application is shared with that employer. They become an independent controller of that data and their own privacy policy applies to how they handle it.',
            'Where a listing is hosted on a partner board such as LinkedIn or Indeed, clicking Apply takes you to that platform. We do not receive or transmit your application in that case — you are dealing with that platform and the employer directly, under their privacy policies.',
          ],
          bullets: [
            'Hosting and database providers, which store the data needed to run the site.',
            'Email delivery providers, used to send account and alert emails.',
            'Analytics providers, used to understand aggregate site usage.',
            'Advertising partners, described in the next section.',
            'Law enforcement or regulators, where we are legally required to disclose.',
          ],
        },
        {
          heading: 'Advertising',
          body: [
            'This site is funded by advertising. When advertising is enabled, we work with Google, which as a third-party vendor uses cookies to serve ads on this site.',
            "Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and other sites on the internet. You can opt out of personalised advertising by visiting Google's Ads Settings, and you can opt out of third-party vendors' use of cookies for personalised advertising at aboutads.info.",
            'We do not place advertising inside application forms or beside apply buttons, and we do not use formats designed to be mistaken for site content or navigation.',
          ],
        },
        {
          heading: 'Cookies',
          body: [
            'We use a small number of cookies. Essential cookies keep you signed in and protect forms from cross-site abuse; these cannot be switched off without breaking the site. Analytics and advertising cookies are only set where you have consented via the banner shown on your first visit.',
            'Our Cookie Policy sets out each cookie, its purpose and its lifetime, and explains how to change your choice.',
          ],
        },
        {
          heading: 'How long we keep data',
          bullets: [
            'Account data: until you delete your account, or after three years of inactivity, whichever comes first.',
            'Applications: for two years, so you retain a record of your job search history and employers can meet their own record-keeping obligations.',
            'Job alerts: until you unsubscribe.',
            'Technical logs: 90 days.',
            'Audit records of moderation decisions: three years, so we can account for why a listing was removed.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'Depending on where you live, you have some or all of the following rights over your personal data. We will respond to any request within one month, and we will not charge you for exercising them.',
          ],
          bullets: [
            'Access — a copy of the personal data we hold about you.',
            'Rectification — correction of anything inaccurate. You can edit most of it yourself in your profile.',
            'Erasure — deletion of your account and associated data. Note that applications already sent to an employer are held by that employer under their own policy.',
            'Restriction and objection — to limit or object to certain processing, including direct marketing.',
            'Portability — a machine-readable copy of the data you gave us.',
            'Withdrawal of consent — at any time, without affecting processing that already took place.',
            'Complaint — to your local data protection authority, if you think we have handled your data unlawfully.',
          ],
        },
        {
          heading: 'Security',
          body: [
            'Passwords are stored hashed with a per-password salt. Sessions use signed, HTTP-only cookies that JavaScript cannot read. All traffic is served over HTTPS with strict transport security enabled, and we apply rate limits to sign-in, registration and application endpoints to limit automated abuse.',
            'No system is perfectly secure. If we ever become aware of a breach affecting your personal data, we will notify you and the relevant authority as required by law.',
          ],
        },
        {
          heading: "Children's data",
          body: [
            'This site is not intended for children under 16, and we do not knowingly collect their personal data. If you believe a child has created an account, contact us and we will delete it.',
          ],
        },
        {
          heading: 'International transfers',
          body: [
            'Our providers may process data in countries other than your own. Where that happens we rely on appropriate safeguards, such as standard contractual clauses, to protect your data to the standard required by your local law.',
          ],
        },
        {
          heading: 'Changes to this policy',
          body: [
            'We will update this page when our practices change, and we will change the "last updated" date at the top. Where the change materially affects your rights we will notify account holders by email before it takes effect.',
          ],
        },
      ]}
    />
  )
}

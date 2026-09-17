import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description:
    'The terms governing use of CareerHub by job seekers and employers, including acceptable use, listing rules, liability and account termination.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      href="/terms"
      intro={`These terms govern your use of ${site.name}. By using the site you accept them. If you do not accept them, please do not use the site.`}
      sections={[
        {
          heading: 'The service',
          body: [
            `${site.name} is a career resource website. We publish job listings, company profiles and original editorial guidance, and we provide free tools for job seekers. Some listings are posted directly by employers; others are sourced from partner job boards and link to the employer's own application page on those platforms.`,
            'The service is free for job seekers. We do not charge for applying, for using the tools, or for reading any of our guidance, and we never will.',
          ],
        },
        {
          heading: 'Your account',
          bullets: [
            'You must be at least 16 years old to create an account.',
            'Provide accurate information and keep it up to date.',
            'You are responsible for keeping your password confidential and for activity under your account.',
            'One person, one account. Do not share credentials or create accounts on behalf of others without authority.',
            'Tell us promptly if you believe your account has been accessed without your permission.',
          ],
        },
        {
          heading: 'Applying for jobs, and what happens to your data',
          body: [
            `When you submit an application through ${site.name}, you provide us with personal data: your name, your email address, your telephone number where given, the CV file you upload and any covering note you write. You are asked to confirm, by ticking the box on the application form, that you have read and accept this section and our Privacy Policy. We do not accept an application without that confirmation.`,
            `By submitting an application you acknowledge and agree that ${site.name} will store the information you provide, including the contents of your CV, on its systems and in its database, and will process it for the purposes set out below. Your data is held on servers operated by our hosting and database providers, who process it only on our instructions and under written terms.`,
          ],
          bullets: [
            `To transmit your application, in full and including your CV, to the employer or recruiter who posted the listing you applied to. That employer becomes an independent controller of your data from the moment they receive it, and their own privacy policy governs what they do with it afterwards. ${site.name} is not able to recall, amend or delete an application once the employer has received it.`,
            'To notify you that your application was received, and to let you see it in your dashboard so you keep a record of where you have applied.',
            'To let you reuse a CV you have already uploaded for later applications, so you are not asked for the same file repeatedly.',
            'To detect and prevent fraudulent listings, duplicate or automated applications, and misuse of the service.',
            'To meet our own legal and record-keeping obligations.',
          ],
        },
        {
          heading: 'Retention, withdrawal and your control',
          bullets: [
            `We keep applications for two years from the date of submission, so that you retain a record of your job search and so employers can meet their own record-keeping obligations. After that they are deleted. Full retention periods for every category of data are set out in the Privacy Policy.`,
            'You may withdraw your consent, ask for a copy of what we hold, or ask us to delete your data at any time by writing to the address in the Privacy Policy. Withdrawing consent does not affect processing already carried out, and it cannot oblige an employer to delete an application they have already received — you would need to contact them directly.',
            'Deleting your account removes your profile and your stored CV from our systems. Applications already delivered to an employer remain with that employer.',
            `${site.name} does not sell personal data, does not share applicant data with anyone other than the employer you applied to and the service providers described in the Privacy Policy, and does not use the contents of your CV for advertising.`,
          ],
        },
        {
          heading: 'Applying on a partner site',
          body: [
            `Some listings are sourced from partner job boards and send you to the employer's own application page. Where a listing does that, the apply button says so before you click it. In those cases your application is made on that third party's platform, ${site.name} never receives your CV or your details, and that platform's terms and privacy policy apply instead of ours. We have no control over, and accept no responsibility for, how a third-party platform handles your data.`,
          ],
        },
        {
          heading: 'Acceptable use',
          body: ['You agree not to do any of the following.'],
          bullets: [
            'Post false, misleading or fraudulent job listings, or listings for roles that do not exist.',
            'Ask candidates for payment of any kind, at any stage, or request bank or identity documents before a written offer.',
            'Scrape, crawl or bulk-download the site, or use automated means to submit applications.',
            'Post discriminatory listings, or content that is unlawful, defamatory, harassing or infringing.',
            'Impersonate another person or organisation, or misrepresent your association with one.',
            'Attempt to gain unauthorised access to the site, other accounts, or our infrastructure.',
            'Use personal data obtained through the site for any purpose other than the recruitment for which it was provided.',
          ],
        },
        {
          heading: 'Rules for employers',
          bullets: [
            'Listings are reviewed before publication. We may reject or remove any listing at our discretion, and we do not owe an explanation, although we usually give one.',
            'You must have the authority to advertise the role and to represent the named employer.',
            'Listings must identify the employer, describe genuine work, and state the location and working arrangement accurately.',
            'Applications received through CareerHub contain personal data. You must process it only for that recruitment, keep it secure, and comply with applicable data protection law.',
            'Where you direct candidates to an external application page, that page must be the employer’s genuine application route for the advertised role.',
          ],
        },
        {
          heading: 'Content and intellectual property',
          body: [
            `The editorial content on this site — guides, analysis, skills breakdowns, salary commentary and interview preparation — is written by ${site.name} and is our intellectual property. You may read, print and share links to it for personal use. You may not republish it in bulk or present it as your own.`,
            'Employers retain ownership of the listing text they submit and grant us a licence to display, format and distribute it as part of the service, including in search results and syndicated feeds.',
            'Content you submit — reviews, applications, profile details — remains yours, and you grant us the licence needed to operate the service.',
          ],
        },
        {
          heading: 'Third-party listings and links',
          body: [
            'Some listings link to LinkedIn, Indeed or other third-party platforms. We are not affiliated with, endorsed by, or acting as an agent for those platforms, and we do not control what happens once you leave this site. Their terms and privacy policies apply to your use of them.',
            'We take reasonable care in reviewing listings, but we cannot independently verify every claim an employer makes. Verify pay, conditions and the employer’s identity before accepting any offer, and read our guide on spotting job scams.',
          ],
        },
        {
          heading: 'No employment guarantee',
          body: [
            'We provide a platform and editorial guidance. We do not guarantee that any listing is current, that you will receive a response, or that you will be offered a role. Our guidance is general information, not personalised career, legal, financial or immigration advice.',
          ],
        },
        {
          heading: 'Availability',
          body: [
            'We aim to keep the site available but we do not promise uninterrupted service. We may change, suspend or discontinue features, and we may perform maintenance without notice.',
          ],
        },
        {
          heading: 'Limitation of liability',
          body: [
            'To the fullest extent permitted by law, we are not liable for indirect or consequential loss, loss of profits, loss of opportunity, or losses arising from your dealings with any employer or third-party platform.',
            'Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.',
          ],
        },
        {
          heading: 'Termination',
          body: [
            'You may delete your account at any time. We may suspend or terminate an account that breaches these terms, and we will remove listings that break our listing rules. Where we terminate an employer account for fraudulent listings, we may retain a record of the decision for our audit log.',
          ],
        },
        {
          heading: 'Changes',
          body: [
            'We may update these terms. The date at the top of this page shows when they last changed. Continued use after a change means you accept the updated terms; where the change is material we will notify account holders by email.',
          ],
        },
      ]}
    />
  )
}

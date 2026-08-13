import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Editorial Policy',
  description:
    'How CareerHub researches, writes, reviews, updates and corrects its career guidance, and how advertising is kept separate from editorial judgement.',
  path: '/editorial-policy',
})

export default function EditorialPolicyPage() {
  return (
    <LegalPage
      title="Editorial Policy"
      href="/editorial-policy"
      intro={`Everything published on ${site.name} follows this policy. It exists so you can judge how much weight to give what you read here.`}
      sections={[
        {
          heading: 'Who writes for us',
          body: [
            'Every guide is written by a named author with direct working experience of the subject — recruiters, hiring managers, compensation specialists and career coaches. We do not publish anonymous articles, and we do not commission writers to produce material on subjects they have not worked in.',
            'Author names and roles appear at the top and bottom of each article. Where an author has a relevant conflict of interest, we say so in the article.',
          ],
        },
        {
          heading: 'How we research',
          bullets: [
            'Primary experience first: what the author has seen work, and what they have seen fail.',
            'Advertised salary bands and published public-sector pay scales for compensation material, rather than aggregated self-reported figures alone.',
            'Official sources for anything regulatory — professional registration, licensing, right-to-work requirements.',
            'Where a claim is contested or varies by country, we say so rather than presenting one market as universal.',
          ],
        },
        {
          heading: 'Review before publication',
          steps: [
            'The author drafts and states which claims are experience-based and which are sourced.',
            'A second team member reviews for accuracy, and challenges anything that reads as generic advice.',
            'We check that the article says something specific enough to act on. If a draft could apply equally to any role in any country, it goes back.',
            'Legal and regulatory claims are checked against a current official source before publication.',
          ],
        },
        {
          heading: 'Job page analysis',
          body: [
            'The analysis attached to each job page — the summary, skills breakdown, career path, salary insight and interview preparation — is produced by us, from the structured attributes of the role, using an editorial framework our team wrote and maintains. It is not copied from the employer, and the employer does not review or approve it.',
            'Employers cannot pay to change it, remove it, or soften it. If an employer believes a factual error has been made, they can write to us and we will check it like any other correction.',
          ],
        },
        {
          heading: 'Advertising and independence',
          body: [
            'The site is funded by advertising and, in future, optional featured listings for employers. Neither buys editorial coverage.',
            'Featured listings are labelled as featured wherever they appear. Advertising is labelled as advertising. We do not place advertising inside application forms, beside apply buttons, or in formats designed to be mistaken for editorial content or navigation.',
            'No advertiser sees an article before publication, and no advertiser has ever been given approval over anything on this site.',
          ],
        },
        {
          heading: 'Updates and corrections',
          body: [
            'Career advice ages. We review guides at least annually, and immediately when something material changes — a law, a widespread hiring practice, a salary market that has moved.',
            'When we correct a substantive error we amend the article and update the "last updated" date. Where the original was materially misleading, we note what changed rather than quietly editing it.',
          ],
        },
        {
          heading: 'What we will not publish',
          bullets: [
            'Guaranteed-outcome claims. Nobody can promise you a job, and anyone who does is selling something.',
            'Advice that depends on misleading an employer — invented experience, fabricated competing offers, undisclosed use of someone else’s work.',
            'Republished job descriptions presented as editorial content.',
            'Sponsored articles disguised as independent guidance.',
          ],
        },
        {
          heading: 'Telling us we are wrong',
          body: [
            `If something here is inaccurate, out of date, or unclear, email ${site.editorialEmail} with the page and what you think is wrong. We read every message and reply to substantive corrections within five working days. Corrections from readers have improved several of these guides, and we would rather be corrected than confident.`,
          ],
        },
      ]}
    />
  )
}

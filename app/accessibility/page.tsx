import type { Metadata } from 'next'

import { LegalPage } from '@/components/legal-page'
import { buildMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export const metadata: Metadata = buildMetadata({
  title: 'Accessibility Statement',
  description:
    'Our commitment to WCAG 2.1 AA, the accessibility features built into CareerHub, known limitations, and how to report a barrier.',
  path: '/accessibility',
})

export default function AccessibilityPage() {
  return (
    <LegalPage
      title="Accessibility Statement"
      href="/accessibility"
      intro={`${site.name} is built to be usable by everyone, including people using screen readers, keyboard navigation, magnification or reduced motion settings.`}
      sections={[
        {
          heading: 'Our target',
          body: [
            'We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA. We test against that standard as part of building each feature rather than as an afterthought, because retrofitting accessibility is both harder and worse.',
          ],
        },
        {
          heading: 'What we have built in',
          bullets: [
            'Semantic HTML throughout: real headings in order, real buttons and links, real form labels. Nothing important is a clickable div.',
            'Full keyboard operability, including a visible focus indicator on every interactive element and a skip link to the main content.',
            'A colour palette checked for contrast against WCAG AA thresholds in both light and dark mode.',
            'Form fields with associated labels, hint text, and errors announced to assistive technology rather than shown only in colour.',
            'Touch targets of at least 44 pixels on mobile, and a bottom navigation bar reachable one-handed.',
            'Respect for the prefers-reduced-motion setting: animation and smooth scrolling are disabled when you have asked your system for less motion.',
            'Text that reflows and remains readable at 200% zoom without horizontal scrolling.',
            'Descriptive page titles and breadcrumbs so screen reader users always know where they are.',
          ],
        },
        {
          heading: 'Known limitations',
          bullets: [
            'The resume builder preview is dense on very small screens. It remains readable and operable, but a wider screen is easier for extended editing.',
            'Some employer-supplied listing text may use inconsistent structure. We normalise formatting but cannot rewrite an employer’s wording.',
            'Third-party advertising, once enabled, is served by Google and we do not control its internal markup.',
          ],
        },
        {
          heading: 'Report a barrier',
          body: [
            `If something on this site is difficult or impossible to use, please tell us at ${site.email}. Include the page, what you were trying to do, and the assistive technology you use if relevant. We aim to respond within five working days and to fix confirmed accessibility defects ahead of feature work.`,
          ],
        },
      ]}
    />
  )
}

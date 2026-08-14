/**
 * Single source of truth for branding, contact details and public URLs.
 * Change these values once and the whole site (metadata, JSON-LD, footer,
 * sitemap, legal pages) follows.
 */
export const site = {
  name: 'CareerHub',
  shortName: 'CareerHub',
  domain: 'careerhub.com.ng',
  tagline: 'Jobs, career guides and tools that actually help you get hired',
  description:
    'CareerHub is a career resource centre. Search verified jobs, apply in one place, and use free guides, salary data and resume tools written by working recruiters.',
  /**
   * Canonical origin. Everything user-visible derives from this: metadata,
   * canonicals, Open Graph, JSON-LD, the sitemap, the RSS and job feeds, and
   * every link in an outgoing email. Set NEXT_PUBLIC_SITE_URL in production;
   * the live domain is the fallback so a missing variable cannot silently
   * publish localhost URLs into search results.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'production' ? 'https://careerhub.com.ng' : 'http://localhost:3000'),
  locale: 'en_NG',
  /** Published contact addresses. Set these up as forwarders on the domain. */
  email: 'hello@careerhub.com.ng',
  supportEmail: 'support@careerhub.com.ng',
  jobsEmail: 'jobs@careerhub.com.ng',
  privacyEmail: 'privacy@careerhub.com.ng',
  editorialEmail: 'editorial@careerhub.com.ng',
  /**
   * Operator inbox. Receives a copy of everything that happens on the site:
   * new job postings awaiting review, every application, new registrations and
   * repeated failed sign-ins. Override with ADMIN_EMAIL.
   */
  adminEmail: process.env.ADMIN_EMAIL ?? 'hiringhub001@gmail.com',
  /** From address on outbound mail. Must be a domain verified with Resend. */
  fromEmail: process.env.EMAIL_FROM ?? 'CareerHub <notifications@careerhub.com.ng>',
  address: 'Remote-first — registered office details available on request',
  founded: 2024,
  social: {
    twitter: '@careerhubng',
    linkedin: 'https://www.linkedin.com/company/careerhubng',
  },
  /** Set NEXT_PUBLIC_ADSENSE_CLIENT once your AdSense account is approved. */
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
  /**
   * GA4 measurement ID.
   *
   * Defaulted in code rather than left empty. NEXT_PUBLIC_* variables are
   * inlined at build time, so an unset variable in Vercel silently produced no
   * tag at all — which looks identical to a broken install and is why Google
   * kept reporting "tag not detected". A measurement ID is public (it is
   * visible in the page source of every site using it), so there is nothing to
   * protect by hiding it. Set NEXT_PUBLIC_GA_ID to point at a different
   * property without a code change.
   */
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? 'G-DEXV6YXTZB',
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? '',
  /**
   * Google Search Console HTML-tag verification token.
   *
   * Rendered by the root layout's metadata as
   * <meta name="google-site-verification" …>. Keep it in place permanently:
   * Google re-checks periodically and removing the tag un-verifies the
   * property, which also drops the Search Console data feeding your sitemap
   * and indexing reports.
   */
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
    '8euaUVHVkIhg5YaLtTEMo9vbjBiV5n54-PuYmRZNww4',
} as const

export const partnerBoards = {
  LINKEDIN: { label: 'LinkedIn', color: 'bg-[#0a66c2]' },
  INDEED: { label: 'Indeed', color: 'bg-[#2557a7]' },
  GLASSDOOR: { label: 'Glassdoor', color: 'bg-[#0caa41]' },
  OTHER: { label: 'Partner board', color: 'bg-slate-600' },
  DIRECT: { label: 'Direct', color: 'bg-brand-600' },
} as const

export type PartnerBoard = keyof typeof partnerBoards

export function absoluteUrl(path = '/'): string {
  return new URL(path, site.url).toString()
}

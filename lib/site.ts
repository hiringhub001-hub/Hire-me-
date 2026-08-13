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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'en_NG',
  email: 'hello@careerhub.com.ng',
  supportEmail: 'support@careerhub.com.ng',
  editorialEmail: 'editorial@careerhub.com.ng',
  /** Every application and every new job posting is copied to this address. */
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@careerhub.com.ng',
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
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? '',
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID ?? '',
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

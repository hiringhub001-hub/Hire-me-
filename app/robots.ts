import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Account areas hold personal data and filtered search URLs are
        // near-duplicates of /jobs — neither belongs in an index.
        // Private areas and near-duplicate filtered search URLs. These are not
        // SEO pages and must not compete with the canonical listing.
        disallow: [
          '/dashboard',
          '/employer',
          '/admin',
          '/recruiter-access',
          '/signin',
          '/signup',
          '/api/',
          '/jobs?',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}

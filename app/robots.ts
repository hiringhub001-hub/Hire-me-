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
        disallow: [
          '/dashboard',
          '/employer',
          '/admin',
          '/signin',
          '/api/',
          '/jobs?',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  }
}

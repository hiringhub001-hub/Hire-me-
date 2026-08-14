import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Stated explicitly so the intent is unmistakable: the job index and
        // every individual job page are crawlable. Only the query-string
        // variants below are not.
        allow: ['/', '/jobs', '/jobs/'],
        // Private areas hold personal data. The `/jobs?` rule blocks filtered
        // and paginated search URLs, which are near-duplicates of /jobs and
        // would compete with it.
        //
        // `?` is a literal character in robots.txt — only `*` and `$` are
        // wildcards — so `/jobs?` matches `/jobs?q=react` and nothing else.
        // `/jobs`, `/jobs/frontend-developer-lagos`, `/jobs/category/...` and
        // `/jobs/location/...` are all unaffected, because none of them has a
        // `?` in that position.
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

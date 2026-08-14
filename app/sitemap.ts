import type { MetadataRoute } from 'next'

import { prisma } from '@/lib/db'
import { kindPaths } from '@/content/posts'
import {
  MIN_JOBS_FOR_LOCATION_INDEX,
  getIndexableCategories,
  getLocationCounts,
} from '@/features/jobs/queries'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, companies, posts, categories, locations] = await Promise.all([
    prisma.job.findMany({
      // Expired listings are noindex, so they stay out of the sitemap too.
      where: {
        status: 'PUBLISHED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { slug: true, updatedAt: true },
    }),
    prisma.company.findMany({
      where: { approved: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, kind: true, updatedAt: true },
    }),
    getIndexableCategories(),
    getLocationCounts(),
  ])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/jobs'), lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/companies'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/career'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/interview'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/salary'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/tools'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/tools/resume-builder'), lastModified: now, priority: 0.7 },
    { url: absoluteUrl('/tools/cover-letter-builder'), lastModified: now, priority: 0.7 },
    { url: absoluteUrl('/tools/job-match'), lastModified: now, priority: 0.7 },
    { url: absoluteUrl('/job-alerts'), lastModified: now, priority: 0.6 },
    { url: absoluteUrl('/for-employers'), lastModified: now, priority: 0.6 },
    { url: absoluteUrl('/about'), lastModified: now, priority: 0.5 },
    { url: absoluteUrl('/contact'), lastModified: now, priority: 0.5 },
    { url: absoluteUrl('/faq'), lastModified: now, priority: 0.5 },
    { url: absoluteUrl('/careers'), lastModified: now, priority: 0.4 },
    { url: absoluteUrl('/sitemap'), lastModified: now, priority: 0.4 },
    { url: absoluteUrl('/editorial-policy'), lastModified: now, priority: 0.4 },
    { url: absoluteUrl('/privacy'), lastModified: now, priority: 0.3 },
    { url: absoluteUrl('/terms'), lastModified: now, priority: 0.3 },
    { url: absoluteUrl('/cookies'), lastModified: now, priority: 0.3 },
    { url: absoluteUrl('/accessibility'), lastModified: now, priority: 0.3 },
    { url: absoluteUrl('/disclaimer'), lastModified: now, priority: 0.3 },
    { url: absoluteUrl('/get-started'), lastModified: now, priority: 0.5 },
  ]

  return [
    ...staticRoutes,
    // Real landing pages, not `?category=` query strings: those are blocked by
    // robots.txt, so submitting them here would ask Google to crawl something
    // we have explicitly told it not to.
    ...categories.map((category) => ({
      url: absoluteUrl(`/jobs/category/${category.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    // Only locations with enough live roles to be worth landing on.
    ...locations
      .filter((location) => location.count >= MIN_JOBS_FOR_LOCATION_INDEX)
      .map((location) => ({
        url: absoluteUrl(`/jobs/location/${location.slug}`),
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
    ...jobs.map((job) => ({
      url: absoluteUrl(`/jobs/${job.slug}`),
      lastModified: job.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...companies.map((company) => ({
      url: absoluteUrl(`/company/${company.slug}`),
      lastModified: company.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`${kindPaths[post.kind as keyof typeof kindPaths]}/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}

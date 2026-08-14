import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'

export const JOBS_PER_PAGE = 12

export type JobFilters = {
  q?: string
  location?: string
  category?: string
  workMode?: string
  employment?: string
  experience?: string
  education?: string
  source?: string
  company?: string
  salaryMin?: number
  sort?: 'recent' | 'salary' | 'relevant'
  page?: number
}

/** Selection shared by every list view so cards render from one shape. */
const jobCardSelect = {
  id: true,
  slug: true,
  title: true,
  city: true,
  country: true,
  workMode: true,
  employment: true,
  experience: true,
  salaryMin: true,
  salaryMax: true,
  salaryPeriod: true,
  currency: true,
  skills: true,
  source: true,
  sourceName: true,
  externalUrl: true,
  allowInternal: true,
  featured: true,
  postedAt: true,
  editorialSummary: true,
  description: true,
  company: {
    select: { name: true, slug: true, logoUrl: true, industry: true },
  },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.JobSelect

export type JobCardData = Prisma.JobGetPayload<{ select: typeof jobCardSelect }>

/**
 * Live means published and not past its expiry date. Google requires expired
 * postings to stop appearing, and candidates should never apply to a dead role.
 */
export const liveJobWhere: Prisma.JobWhereInput = {
  status: 'PUBLISHED',
  OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
}

export function buildJobWhere(filters: JobFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: 'PUBLISHED' }
  const and: Prisma.JobWhereInput[] = [
    { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
  ]
  if (filters.q) {
    const q = filters.q.trim()
    // PostgreSQL's LIKE is case-sensitive, so every text match is explicitly
    // insensitive. Swap this block for a tsvector index or Meilisearch when the
    // listing count makes ILIKE scans too slow.
    and.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { skills: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { company: { name: { contains: q, mode: 'insensitive' } } },
      ],
    })
  }

  if (filters.location) {
    const loc = filters.location.trim()
    and.push({
      OR: [
        { city: { contains: loc, mode: 'insensitive' } },
        { country: { contains: loc, mode: 'insensitive' } },
      ],
    })
  }

  if (filters.category) where.category = { slug: filters.category }
  if (filters.company) where.company = { slug: filters.company }
  if (filters.workMode) where.workMode = filters.workMode
  if (filters.employment) where.employment = filters.employment
  if (filters.experience) where.experience = filters.experience
  if (filters.education) where.education = filters.education
  if (filters.source) where.source = filters.source
  if (filters.salaryMin) where.salaryMax = { gte: filters.salaryMin }

  if (and.length) where.AND = and
  return where
}

function buildOrderBy(sort: JobFilters['sort']): Prisma.JobOrderByWithRelationInput[] {
  if (sort === 'salary') return [{ salaryMax: 'desc' }, { postedAt: 'desc' }]
  return [{ featured: 'desc' }, { postedAt: 'desc' }]
}

export async function searchJobs(filters: JobFilters) {
  const page = Math.max(1, filters.page ?? 1)
  const where = buildJobWhere(filters)

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      select: jobCardSelect,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * JOBS_PER_PAGE,
      take: JOBS_PER_PAGE,
    }),
    prisma.job.count({ where }),
  ])

  return {
    jobs,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / JOBS_PER_PAGE)),
  }
}

export async function getJobBySlug(slug: string) {
  return prisma.job.findFirst({
    // Expired listings still resolve here so the page can say the role has
    // closed rather than 404ing on a link somebody shared last month.
    where: { slug, status: 'PUBLISHED' },
    include: {
      company: { include: { locations: true } },
      category: true,
      faqs: { orderBy: { position: 'asc' } },
    },
  })
}

/** Related roles for internal linking: same category first, then same city. */
export async function getSimilarJobs(job: {
  id: string
  categoryId: string | null
  city: string
  companyId: string
}) {
  const sameCategory = await prisma.job.findMany({
    where: {
      ...liveJobWhere,
      id: { not: job.id },
      ...(job.categoryId ? { categoryId: job.categoryId } : {}),
    },
    select: jobCardSelect,
    orderBy: { postedAt: 'desc' },
    take: 6,
  })

  if (sameCategory.length >= 3) return sameCategory

  const sameCity = await prisma.job.findMany({
    where: {
      ...liveJobWhere,
      id: { not: job.id },
      city: job.city,
      NOT: { id: { in: sameCategory.map((item) => item.id) } },
    },
    select: jobCardSelect,
    orderBy: { postedAt: 'desc' },
    take: 6 - sameCategory.length,
  })

  return [...sameCategory, ...sameCity]
}

export async function getFeaturedJobs(take = 6) {
  return prisma.job.findMany({
    where: liveJobWhere,
    select: jobCardSelect,
    orderBy: [{ featured: 'desc' }, { postedAt: 'desc' }],
    take,
  })
}

export async function getJobFacets() {
  const [categories, countries, total, remote] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        name: true,
        slug: true,
        description: true,
        _count: { select: { jobs: { where: liveJobWhere } } },
      },
    }),
    prisma.job.groupBy({
      by: ['country'],
      where: liveJobWhere,
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 12,
    }),
    prisma.job.count({ where: liveJobWhere }),
    prisma.job.count({ where: { ...liveJobWhere, workMode: 'REMOTE' } }),
  ])

  return { categories, countries, total, remote }
}

/* -------------------------------------------------------------------------- */
/* Landing pages                                                               */
/* -------------------------------------------------------------------------- */

/**
 * A category or location only earns a crawlable landing page once it has enough
 * live jobs to be worth reading. Below the threshold the page still renders for
 * anyone who follows a link, but it is marked noindex and kept out of the
 * sitemap — an empty "Jobs in X" page is exactly the thin content that damages
 * a site's standing.
 */
export const MIN_JOBS_FOR_CATEGORY_INDEX = 1
export const MIN_JOBS_FOR_LOCATION_INDEX = 3

export async function getCategoryLanding(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return null

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: { ...liveJobWhere, categoryId: category.id },
      select: jobCardSelect,
      orderBy: [{ featured: 'desc' }, { postedAt: 'desc' }],
      take: JOBS_PER_PAGE,
    }),
    prisma.job.count({ where: { ...liveJobWhere, categoryId: category.id } }),
  ])

  return { category, jobs, total }
}

/** Categories that currently qualify for indexing, for the sitemap. */
export async function getIndexableCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      slug: true,
      _count: { select: { jobs: { where: liveJobWhere } } },
    },
  })
  return categories.filter((c) => c._count.jobs >= MIN_JOBS_FOR_CATEGORY_INDEX)
}

/**
 * Locations are grouped by country. City-level pages would multiply into
 * hundreds of near-identical pages, which is the classic doorway-page pattern.
 */
export async function getLocationCounts() {
  const rows = await prisma.job.groupBy({
    by: ['country'],
    where: liveJobWhere,
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
  })
  return rows.map((row) => ({
    country: row.country,
    slug: slugify(row.country),
    count: row._count.country,
  }))
}

export async function getLocationLanding(slug: string) {
  const locations = await getLocationCounts()
  const match = locations.find((location) => location.slug === slug)
  if (!match) return null

  const jobs = await prisma.job.findMany({
    where: { ...liveJobWhere, country: match.country },
    select: jobCardSelect,
    orderBy: [{ featured: 'desc' }, { postedAt: 'desc' }],
    take: JOBS_PER_PAGE,
  })

  return { ...match, jobs, total: match.count }
}

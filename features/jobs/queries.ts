import 'server-only'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'

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

export function buildJobWhere(filters: JobFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: 'PUBLISHED' }
  const and: Prisma.JobWhereInput[] = []

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
      status: 'PUBLISHED',
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
      status: 'PUBLISHED',
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
    where: { status: 'PUBLISHED' },
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
        _count: { select: { jobs: { where: { status: 'PUBLISHED' } } } },
      },
    }),
    prisma.job.groupBy({
      by: ['country'],
      where: { status: 'PUBLISHED' },
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 12,
    }),
    prisma.job.count({ where: { status: 'PUBLISHED' } }),
    prisma.job.count({ where: { status: 'PUBLISHED', workMode: 'REMOTE' } }),
  ])

  return { categories, countries, total, remote }
}

import 'server-only'

import { prisma } from '@/lib/db'
import type { Section } from '@/content/posts/types'

export type PostKind = 'BLOG' | 'CAREER' | 'INTERVIEW' | 'SALARY'

export type PostBody = {
  sections: Section[]
  faqs: { question: string; answer: string }[]
}

/** Body is stored as JSON text; this is the only place that parses it. */
export function parseBody(body: string): PostBody {
  try {
    const parsed = JSON.parse(body) as Partial<PostBody>
    return { sections: parsed.sections ?? [], faqs: parsed.faqs ?? [] }
  } catch {
    return { sections: [], faqs: [] }
  }
}

export async function getPostsByKind(kind: PostKind) {
  return prisma.post.findMany({
    where: { kind, published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      kind: true,
      title: true,
      excerpt: true,
      category: true,
      tags: true,
      authorName: true,
      readMinutes: true,
      publishedAt: true,
    },
  })
}

export async function getPost(kind: PostKind, slug: string) {
  return prisma.post.findFirst({ where: { kind, slug, published: true } })
}

/** Related articles: same category first, then any other recent piece. */
export async function getRelatedPosts(kind: PostKind, slug: string, category: string) {
  const sameCategory = await prisma.post.findMany({
    where: { published: true, category, NOT: { kind, slug } },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    select: { slug: true, kind: true, title: true, excerpt: true, readMinutes: true },
  })
  if (sameCategory.length >= 3) return sameCategory

  const others = await prisma.post.findMany({
    where: { published: true, NOT: { kind, slug } },
    orderBy: { publishedAt: 'desc' },
    take: 4 - sameCategory.length,
    select: { slug: true, kind: true, title: true, excerpt: true, readMinutes: true },
  })
  const seen = new Set(sameCategory.map((post) => `${post.kind}:${post.slug}`))
  return [...sameCategory, ...others.filter((post) => !seen.has(`${post.kind}:${post.slug}`))]
}

export async function getAllPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      kind: true,
      title: true,
      excerpt: true,
      category: true,
      publishedAt: true,
      updatedAt: true,
      authorName: true,
    },
  })
}

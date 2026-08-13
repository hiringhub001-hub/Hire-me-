import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { ContentArticlePage, buildArticleMetadata } from '@/features/content/pages'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { kind: 'INTERVIEW', published: true },
      select: { slug: true },
    })
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    // Database unavailable at build time: render on demand instead.
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return buildArticleMetadata('INTERVIEW', slug)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ContentArticlePage kind="INTERVIEW" slug={slug} />
}

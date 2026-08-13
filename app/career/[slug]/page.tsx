import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { ContentArticlePage, buildArticleMetadata } from '@/features/content/pages'

export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { kind: 'CAREER', published: true },
    select: { slug: true },
  })
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return buildArticleMetadata('CAREER', slug)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ContentArticlePage kind="CAREER" slug={slug} />
}

import { prisma } from '@/lib/db'
import { kindPaths } from '@/content/posts'
import { absoluteUrl, site } from '@/lib/site'

export const revalidate = 3600

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<Response> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: {
      slug: true,
      kind: true,
      title: true,
      excerpt: true,
      category: true,
      authorName: true,
      publishedAt: true,
    },
  })

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`${kindPaths[post.kind as keyof typeof kindPaths]}/${post.slug}`)
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      <dc:creator>${escapeXml(post.authorName)}</dc:creator>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(site.name)} — career guides and job search advice</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

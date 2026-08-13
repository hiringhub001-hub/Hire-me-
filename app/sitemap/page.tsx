import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { kindPaths } from '@/content/posts'
import { Breadcrumbs, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'Sitemap',
  description: 'Every section of CareerHub in one place: jobs, companies, guides, tools and policies.',
  path: '/sitemap',
})

export default async function SitemapPage() {
  const [jobs, companies, posts, categories] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { postedAt: 'desc' },
      select: { slug: true, title: true, company: { select: { name: true } } },
    }),
    prisma.company.findMany({
      where: { approved: true },
      orderBy: { name: 'asc' },
      select: { slug: true, name: true },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { title: 'asc' },
      select: { slug: true, kind: true, title: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { slug: true, name: true } }),
  ])

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Sitemap', href: '/sitemap' },
  ]

  const sections: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: 'Main sections',
      links: [
        { href: '/', label: 'Home' },
        { href: '/jobs', label: 'Browse all jobs' },
        { href: '/companies', label: 'Companies hiring' },
        { href: '/career', label: 'Career advice' },
        { href: '/salary', label: 'Salary guides' },
        { href: '/interview', label: 'Interview guides' },
        { href: '/blog', label: 'Blog' },
        { href: '/tools', label: 'Free tools' },
        { href: '/job-alerts', label: 'Job alerts' },
      ],
    },
    {
      title: 'Job categories',
      links: categories.map((category) => ({
        href: `/jobs?category=${category.slug}`,
        label: `${category.name} jobs`,
      })),
    },
    {
      title: 'Free tools',
      links: [
        { href: '/tools/resume-builder', label: 'Resume builder' },
        { href: '/tools/cover-letter-builder', label: 'Cover letter builder' },
        { href: '/tools/job-match', label: 'Job match score' },
      ],
    },
    {
      title: 'Guides and articles',
      links: posts.map((post) => ({
        href: `${kindPaths[post.kind as keyof typeof kindPaths]}/${post.slug}`,
        label: post.title,
      })),
    },
    {
      title: 'Companies',
      links: companies.map((company) => ({
        href: `/company/${company.slug}`,
        label: company.name,
      })),
    },
    {
      title: 'Open jobs',
      links: jobs.map((job) => ({
        href: `/jobs/${job.slug}`,
        label: `${job.title} — ${job.company.name}`,
      })),
    },
    {
      title: 'For employers',
      links: [
        { href: '/for-employers', label: 'How posting works' },
        { href: '/employer/post-job', label: 'Post a job' },
        { href: '/signup?role=employer', label: 'Create an employer account' },
      ],
    },
    {
      title: 'About and policies',
      links: [
        { href: '/about', label: 'About us' },
        { href: '/contact', label: 'Contact' },
        { href: '/faq', label: 'FAQ' },
        { href: '/careers', label: 'Careers at CareerHub' },
        { href: '/editorial-policy', label: 'Editorial policy' },
        { href: '/privacy', label: 'Privacy policy' },
        { href: '/cookies', label: 'Cookie policy' },
        { href: '/terms', label: 'Terms of service' },
        { href: '/accessibility', label: 'Accessibility statement' },
        { href: '/disclaimer', label: 'Disclaimer' },
      ],
    },
  ]

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title="Sitemap"
          intro="Every page on the site. There is also an XML sitemap at /sitemap.xml for search engines and an RSS feed at /rss.xml."
        />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h2>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-brand-600 hover:underline dark:text-slate-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </Section>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { Badge, Breadcrumbs, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'Companies hiring now',
  description:
    'Company profiles with an independent overview, culture and benefits, employee reviews and every open role — so you know what you are applying to before you apply.',
  path: '/companies',
})

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { approved: true },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      slug: true,
      name: true,
      tagline: true,
      industry: true,
      size: true,
      headquarters: true,
      description: true,
      _count: { select: { jobs: { where: { status: 'PUBLISHED' } } } },
    },
  })

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Companies', href: '/companies' },
  ]

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title="Companies hiring now"
          intro="Every profile includes an independent overview of how the company works, its stated benefits, employee reviews where we have them, and all of its open roles. We write the overviews ourselves — they are not marketing copy supplied by the employer."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {companies.map((company) => (
            <Card key={company.slug} className="flex flex-col">
              <div className="flex items-start gap-3">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  aria-hidden
                >
                  {company.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    <Link href={`/company/${company.slug}`} className="hover:underline">
                      {company.name}
                    </Link>
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{company.tagline}</p>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {company.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Badge>{company.industry}</Badge>
                {company.size ? <Badge>{company.size}</Badge> : null}
                <Badge tone="success">
                  {company._count.jobs} open {company._count.jobs === 1 ? 'role' : 'roles'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}

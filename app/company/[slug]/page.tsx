import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { JobCard } from '@/features/jobs/job-card'
import { AdSlot } from '@/components/ad-slot'
import { Badge, Breadcrumbs, Card, Container, JsonLd, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'
import { formatSalary, lines } from '@/lib/utils'

/**
 * Rendered per request, not cached as static HTML.
 *
 * The root layout reads the session, and `getSession` calls `cookies()`. A
 * route with `revalidate` set is rendered in static mode, where `cookies()`
 * throws DYNAMIC_SERVER_USAGE — so every page here that was not prerendered at
 * build time returned 500. That is every job posted since the last deploy,
 * which on a job board is the entire point of the site.
 *
 * Prerendering these was never safe anyway: a cached page bakes in signed-out
 * header and footer chrome, so a signed-in visitor would be shown "Sign in".
 */
export const dynamic = 'force-dynamic'

async function loadCompany(slug: string) {
  return prisma.company.findFirst({
    where: { slug, approved: true },
    include: {
      locations: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: 'desc' } },
      jobs: {
        where: { status: 'PUBLISHED' },
        orderBy: { postedAt: 'desc' },
        select: {
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
          company: { select: { name: true, slug: true, logoUrl: true, industry: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const company = await loadCompany(slug)
  if (!company) {
    return buildMetadata({ title: 'Company not found', description: '', path: `/company/${slug}`, noIndex: true })
  }
  return buildMetadata({
    title: `${company.name} — jobs, culture, benefits and reviews`,
    description: `${company.name} is hiring. Read an independent overview of the company, its benefits and culture, employee reviews and all ${company.jobs.length} open roles.`,
    path: `/company/${company.slug}`,
  })
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const company = await loadCompany(slug)
  if (!company) notFound()

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Companies', href: '/companies' },
    { name: company.name, href: `/company/${company.slug}` },
  ]

  const averageRating = company.reviews.length
    ? company.reviews.reduce((sum, review) => sum + review.rating, 0) / company.reviews.length
    : null

  // Average of the advertised midpoints, as a rough guide only.
  const salaried = company.jobs.filter((job) => job.salaryMin && job.salaryMax)
  const averageSalary =
    salaried.length && salaried[0]
      ? Math.round(
          salaried.reduce((sum, job) => sum + (job.salaryMin! + job.salaryMax!) / 2, 0) /
            salaried.length,
        )
      : null

  const related = await prisma.company.findMany({
    where: { approved: true, industry: company.industry, NOT: { id: company.id } },
    select: { slug: true, name: true, tagline: true },
    take: 4,
  })

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: company.name,
            description: company.description,
            url: absoluteUrl(`/company/${company.slug}`),
            sameAs: company.website ? [company.website] : undefined,
            foundingDate: company.founded ? String(company.founded) : undefined,
            address: company.headquarters
              ? { '@type': 'PostalAddress', addressLocality: company.headquarters }
              : undefined,
            ...(averageRating
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: averageRating.toFixed(1),
                    reviewCount: company.reviews.length,
                    bestRating: 5,
                  },
                }
              : {}),
          }}
        />

        <header className="rounded-2xl border border-slate-200 p-5 sm:p-6 dark:border-slate-800">
          <div className="flex flex-wrap items-start gap-4">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              aria-hidden
            >
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {company.name}
              </h1>
              <p className="mt-1 text-base text-slate-600 dark:text-slate-300">{company.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="brand">{company.industry}</Badge>
                {company.size ? <Badge>{company.size}</Badge> : null}
                {company.founded ? <Badge>Founded {company.founded}</Badge> : null}
                {averageRating ? (
                  <Badge tone="success">
                    {averageRating.toFixed(1)} / 5 from {company.reviews.length} reviews
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 sm:grid-cols-4 dark:border-slate-800">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Open roles</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {company.jobs.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Headquarters</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {company.headquarters ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Average advertised</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {averageSalary && company.jobs[0]
                  ? (formatSalary(averageSalary, null, company.jobs[0].currency, 'YEAR') ?? '—')
                  : 'Not stated'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Website</dt>
              <dd className="mt-0.5 font-semibold">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-brand-600 hover:underline"
                  >
                    Visit
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </header>

        <div className="mt-10 lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
          <div>
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Overview
              </h2>
              <p className="prose-content mt-3">{company.description}</p>
            </section>

            {company.culture ? (
              <section className="mt-10" aria-labelledby="culture-heading">
                <h2 id="culture-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                  Culture and ways of working
                </h2>
                <p className="prose-content mt-3">{company.culture}</p>
              </section>
            ) : null}

            {lines(company.benefits).length ? (
              <section className="mt-10" aria-labelledby="benefits-heading">
                <h2 id="benefits-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                  Benefits
                </h2>
                <ul className="prose-content mt-2">
                  {lines(company.benefits).map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {company.locations.length ? (
              <section className="mt-10" aria-labelledby="locations-heading">
                <h2 id="locations-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                  Office locations
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {company.locations.map((location) => (
                    <li key={location.id}>
                      <Badge>
                        {location.city}, {location.country}
                        {location.isPrimary ? ' · HQ' : ''}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <AdSlot placement="article-inline" />

            <section className="mt-10" aria-labelledby="jobs-heading">
              <h2 id="jobs-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Open roles at {company.name}
              </h2>
              {company.jobs.length ? (
                <div className="mt-4 grid gap-3">
                  {company.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  No open roles right now.{' '}
                  <Link href="/job-alerts" className="text-brand-600 hover:underline">
                    Set an alert
                  </Link>{' '}
                  and we will email you when this employer posts again.
                </p>
              )}
            </section>

            {company.reviews.length ? (
              <section className="mt-10" aria-labelledby="reviews-heading">
                <h2 id="reviews-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                  Employee reviews
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Submitted by current and former employees and reviewed by our moderation team
                  before publication.
                </p>
                <div className="mt-4 space-y-4">
                  {company.reviews.map((review) => (
                    <Card key={review.id}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {review.title}
                        </h3>
                        <Badge tone="success">{review.rating} / 5</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {review.authorName}
                        {review.jobTitle ? ` · ${review.jobTitle}` : ''}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {review.body}
                      </p>
                      {review.pros ? (
                        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                          <strong>Pros:</strong> {review.pros}
                        </p>
                      ) : null}
                      {review.cons ? (
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                          <strong>Cons:</strong> {review.cons}
                        </p>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-10" aria-labelledby="prep-heading">
              <h2 id="prep-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Interviewing at {company.name}
              </h2>
              <div className="prose-content mt-3">
                <p>
                  We do not publish second-hand interview scripts, because they age badly and often
                  describe a process that has since changed. What holds up is preparation aimed at
                  the company&apos;s actual context: {company.industry.toLowerCase()}, at{' '}
                  {company.size ?? 'its current size'}.
                </p>
                <p>
                  Read the overview above and the open roles below, then prepare two examples that
                  map to the responsibilities that appear repeatedly across their listings. Repeated
                  requirements across several adverts are the clearest signal of what the
                  organisation actually values.
                </p>
                <p>
                  Our{' '}
                  <Link href="/interview/behavioural-interview-questions">
                    behavioural interview guide
                  </Link>{' '}
                  covers the questions that appear in almost every process, and the{' '}
                  <Link href="/career/how-to-negotiate-salary">salary negotiation guide</Link>{' '}
                  covers what to do when the offer arrives.
                </p>
              </div>
            </section>

            {related.length ? (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Similar companies
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((item) => (
                    <Card key={item.slug}>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        <Link href={`/company/${item.slug}`} className="hover:underline">
                          {item.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {item.tagline}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="mt-10 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Work here?
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Reviews are moderated before publication and we never publish identifying details.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
                >
                  Submit a review →
                </Link>
              </div>
              <AdSlot placement="sidebar" />
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  )
}

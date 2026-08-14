import Link from 'next/link'
import type { Metadata } from 'next'

import { JOBS_PER_PAGE, getJobFacets, searchJobs, type JobFilters } from '@/features/jobs/queries'
import { JobCardList } from '@/features/jobs/job-card'
import { JobFilters as JobFiltersUI } from '@/features/jobs/job-filters'
import { AdSlot } from '@/components/ad-slot'
import { Breadcrumbs, ButtonLink, Container, EmptyState, JsonLd, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { slugify } from '@/lib/utils'
import { absoluteUrl } from '@/lib/site'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function readFilters(params: Record<string, string | string[] | undefined>): JobFilters {
  const get = (key: string) => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
  }
  const salaryMin = Number(get('salaryMin'))
  const page = Number(get('page'))
  return {
    q: get('q'),
    location: get('location'),
    category: get('category'),
    workMode: get('workMode'),
    employment: get('employment'),
    experience: get('experience'),
    education: get('education'),
    source: get('source'),
    company: get('company'),
    salaryMin: Number.isFinite(salaryMin) && salaryMin > 0 ? salaryMin : undefined,
    sort: get('sort') === 'salary' ? 'salary' : 'recent',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const filters = readFilters(await searchParams)
  const parts: string[] = []
  if (filters.q) parts.push(filters.q)
  if (filters.workMode === 'REMOTE') parts.push('remote')
  if (filters.location) parts.push(`in ${filters.location}`)

  const title = parts.length ? `${parts.join(' ')} jobs` : 'Browse all jobs'
  const description = parts.length
    ? `Current ${parts.join(' ')} vacancies, each with our own skills breakdown, salary context and interview preparation.`
    : 'Search jobs from direct employers and partner boards including LinkedIn and Indeed. Every listing includes original guidance on skills, salary and interview preparation.'

  return buildMetadata({
    title,
    description,
    path: '/jobs',
    // Filtered result pages are useful to users but must not compete with the
    // canonical listing in search results.
    noIndex: Boolean(filters.q || filters.location || (filters.page ?? 1) > 1),
  })
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = readFilters(await searchParams)
  const [{ jobs, total, page, pageCount }, facets] = await Promise.all([
    searchJobs(filters),
    getJobFacets(),
  ])

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Jobs', href: '/jobs' },
  ]

  function pageHref(target: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== 'page') params.set(key, String(value))
    }
    if (target > 1) params.set('page', String(target))
    return `/jobs${params.toString() ? `?${params}` : ''}`
  }

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Job vacancies',
            numberOfItems: jobs.length,
            itemListElement: jobs.map((job, index) => ({
              '@type': 'ListItem',
              position: (page - 1) * JOBS_PER_PAGE + index + 1,
              url: absoluteUrl(`/jobs/${job.slug}`),
              name: job.title,
            })),
          }}
        />

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Browse jobs
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Listings come from employers posting directly on CareerHub and from partner boards such as
          LinkedIn and Indeed. Partner listings are badged and link to the employer&apos;s own
          application page, so you always know where your application is going.
        </p>

        <div className="mt-6">
          <JobFiltersUI categories={facets.categories} total={total} />
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
          <div>
            {jobs.length ? (
              <>
                <JobCardList jobs={jobs} />

                {pageCount > 1 ? (
                  <nav
                    className="mt-8 flex items-center justify-between gap-3"
                    aria-label="Pagination"
                  >
                    {page > 1 ? (
                      <ButtonLink href={pageHref(page - 1)} variant="outline" size="sm" rel="prev">
                        Previous
                      </ButtonLink>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Page {page} of {pageCount}
                    </span>
                    {page < pageCount ? (
                      <ButtonLink href={pageHref(page + 1)} variant="outline" size="sm" rel="next">
                        Next
                      </ButtonLink>
                    ) : (
                      <span />
                    )}
                  </nav>
                ) : null}

                <AdSlot placement="listing-footer" />
              </>
            ) : (
              <EmptyState
                title="No jobs match those filters"
                description="Try removing a filter or widening the location. You can also set up a free alert and we will email you when something matching appears."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <ButtonLink href="/jobs" variant="outline">
                      Clear search
                    </ButtonLink>
                    <ButtonLink href="/job-alerts">Create a job alert</ButtonLink>
                  </div>
                }
              />
            )}

            {/* Original supporting content so a filtered listing page is never thin. */}
            <section className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                How to search effectively on CareerHub
              </h2>
              <div className="prose-content mt-3 max-w-3xl text-base">
                <p>
                  Most people search only by job title, which hides roles advertised under a
                  different name. Searching by skill — &ldquo;React&rdquo;, &ldquo;SQL&rdquo;,
                  &ldquo;safeguarding&rdquo; — usually surfaces more of what you can actually do,
                  because it matches the requirements rather than the label the employer chose.
                </p>
                <p>
                  If a search returns too much, narrow it with one filter at a time and watch the
                  count. If it returns too little, drop the location filter first: remote and hybrid
                  roles are often listed against a head office you would never need to visit
                  weekly.
                </p>
                <p>
                  When you find a role worth applying for, read the skills breakdown on the job page
                  before you write anything. It tells you which two or three requirements the
                  interview is likely to focus on, which is where your CV bullets and cover note
                  should point.
                </p>
              </div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Popular locations
                </h2>
                <ul className="mt-3 space-y-2">
                  {facets.countries.map((country) => (
                    <li key={country.country}>
                      <Link
                        href={`/jobs/location/${slugify(country.country)}`}
                        className="flex items-center justify-between text-sm text-slate-600 hover:text-brand-600 dark:text-slate-400"
                      >
                        {country.country}
                        <span className="text-xs text-slate-400">{country._count.country}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Before you apply
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href="/career/how-to-write-a-resume" className="text-brand-600 hover:underline">
                      How to write a resume that gets read
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/ats-friendly-cv-formatting" className="text-brand-600 hover:underline">
                      ATS-friendly CV formatting
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/how-to-spot-a-job-scam" className="text-brand-600 hover:underline">
                      How to spot a job scam
                    </Link>
                  </li>
                  <li>
                    <Link href="/career/how-to-negotiate-salary" className="text-brand-600 hover:underline">
                      Negotiating your salary
                    </Link>
                  </li>
                </ul>
              </div>

              <AdSlot placement="sidebar" />
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  )
}

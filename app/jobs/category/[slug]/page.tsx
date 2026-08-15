import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import {
  MIN_JOBS_FOR_CATEGORY_INDEX,
  getCategoryLanding,
} from '@/features/jobs/queries'
import { JobLandingPage } from '@/features/jobs/landing-page'
import { buildMetadata } from '@/lib/seo'

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryLanding(slug)
  if (!data) {
    return buildMetadata({ title: 'Not found', description: '', path: `/jobs/category/${slug}`, noIndex: true })
  }

  return buildMetadata({
    title: `${data.category.name} jobs`,
    description: `${data.total} open ${data.category.name.toLowerCase()} ${data.total === 1 ? 'role' : 'roles'}. ${data.category.description}`,
    path: `/jobs/category/${slug}`,
    // A category with nothing in it is thin: useful to a visitor who followed a
    // link, but not something to put in front of a searcher.
    noIndex: data.total < MIN_JOBS_FOR_CATEGORY_INDEX,
  })
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getCategoryLanding(slug)
  if (!data) notFound()

  const { category, jobs, total } = data

  return (
    <JobLandingPage
      eyebrow="Jobs by industry"
      title={`${category.name} jobs`}
      intro={
        total
          ? `${total} open ${category.name.toLowerCase()} ${total === 1 ? 'role' : 'roles'} on CareerHub, from employers hiring directly and from partner boards. Every listing carries our own breakdown of the skills, the interview and the pay.`
          : `No ${category.name.toLowerCase()} roles are open right now. Set an alert and we will email you as soon as one is posted.`
      }
      body={[
        category.description,
        `Applications in this category are read by people, not just software, but they are read quickly. The listings below each include a skills breakdown explaining what the requirements actually mean in the job and how they get tested at interview — worth reading before you write anything.`,
      ]}
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Jobs', href: '/jobs' },
        { name: `${category.name} jobs`, href: `/jobs/category/${slug}` },
      ]}
      jobs={jobs}
      total={total}
      related={[
        { href: '/career/how-to-write-a-resume', label: 'How to write a resume that gets read' },
        { href: '/interview/behavioural-interview-questions', label: 'Behavioural interview questions' },
        { href: '/career/how-to-negotiate-salary', label: 'How to negotiate your salary' },
        { href: '/tools/job-match', label: 'Check how well you match a job advert' },
      ]}
    />
  )
}

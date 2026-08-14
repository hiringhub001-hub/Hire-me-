import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import {
  MIN_JOBS_FOR_LOCATION_INDEX,
  getLocationCounts,
  getLocationLanding,
} from '@/features/jobs/queries'
import { JobLandingPage } from '@/features/jobs/landing-page'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 1800

export async function generateStaticParams() {
  try {
    const locations = await getLocationCounts()
    return locations.map((location) => ({ slug: location.slug }))
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
  const data = await getLocationLanding(slug)
  if (!data) {
    return buildMetadata({ title: 'Not found', description: '', path: `/jobs/location/${slug}`, noIndex: true })
  }

  return buildMetadata({
    title: `Jobs in ${data.country}`,
    description: `${data.total} open ${data.total === 1 ? 'vacancy' : 'vacancies'} in ${data.country}, each with an independent breakdown of the skills, salary context and interview preparation.`,
    path: `/jobs/location/${slug}`,
    // Location pages are generated from data rather than written, so they need
    // a real number of listings behind them before they are worth indexing.
    noIndex: data.total < MIN_JOBS_FOR_LOCATION_INDEX,
  })
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getLocationLanding(slug)
  if (!data) notFound()

  return (
    <JobLandingPage
      eyebrow="Jobs by location"
      title={`Jobs in ${data.country}`}
      intro={`${data.total} open ${data.total === 1 ? 'vacancy' : 'vacancies'} in ${data.country}, from employers hiring directly and from partner boards such as LinkedIn and Indeed.`}
      body={[
        `These are the roles currently open in ${data.country}. Remote positions appear here when the employer can hire in ${data.country}, so it is worth checking the working arrangement on each listing rather than assuming from the location alone.`,
        `Before applying, check what the role should pay in this market. Advertised ranges vary widely between employers of different sizes, and going into a screening call without a figure of your own is the most common way candidates end up under-paid.`,
      ]}
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Jobs', href: '/jobs' },
        { name: `Jobs in ${data.country}`, href: `/jobs/location/${slug}` },
      ]}
      jobs={data.jobs}
      total={data.total}
      related={[
        { href: '/salary', label: 'Salary guides' },
        { href: '/career/remote-work-guide', label: 'Finding a genuinely remote job' },
        { href: '/blog/how-to-spot-a-job-scam', label: 'How to spot a job scam' },
        { href: '/job-alerts', label: 'Get new local jobs by email' },
      ]}
    />
  )
}

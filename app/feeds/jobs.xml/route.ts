import { prisma } from '@/lib/db'
import { absoluteUrl, site } from '@/lib/site'
import { lines } from '@/lib/utils'

// Generated per request so a newly approved job is in the feed immediately,
// rather than after an ISR revalidation cycle. The response is still cached for
// ten minutes at the CDN via Cache-Control, so origin load stays trivial.
export const dynamic = 'force-dynamic'

/**
 * Job feed in the Indeed XML format, which most aggregators (Indeed, Jooble,
 * Talent.com, Adzuna and others) accept directly.
 *
 * This is the outbound half of the aggregation model: partners index these
 * listings and send candidates to the CareerHub job page to apply. Only
 * published listings that accept applications here are included — there is no
 * point syndicating a role whose application lives on another board, and doing
 * so would create a duplicate of that board's own listing.
 */

function cdata(value: string): string {
  // ]]> would terminate the section early, so split any occurrence.
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

export async function GET(): Promise<Response> {
  const jobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED', allowInternal: true, source: 'DIRECT' },
    orderBy: { postedAt: 'desc' },
    take: 500,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      responsibilities: true,
      requirements: true,
      benefits: true,
      city: true,
      country: true,
      workMode: true,
      employment: true,
      experience: true,
      salaryMin: true,
      salaryMax: true,
      salaryPeriod: true,
      currency: true,
      postedAt: true,
      category: { select: { name: true } },
      company: { select: { name: true } },
    },
  })

  const items = jobs
    .map((job) => {
      const url = `${absoluteUrl(`/jobs/${job.slug}`)}?utm_source=jobfeed&utm_medium=aggregator`

      // Aggregators expect one HTML blob, so the structured columns are
      // reassembled into a readable description here.
      const description = [
        `<p>${job.description}</p>`,
        lines(job.responsibilities).length
          ? `<h3>Responsibilities</h3><ul>${lines(job.responsibilities).map((item) => `<li>${item}</li>`).join('')}</ul>`
          : '',
        lines(job.requirements).length
          ? `<h3>Requirements</h3><ul>${lines(job.requirements).map((item) => `<li>${item}</li>`).join('')}</ul>`
          : '',
        lines(job.benefits).length
          ? `<h3>Benefits</h3><ul>${lines(job.benefits).map((item) => `<li>${item}</li>`).join('')}</ul>`
          : '',
      ]
        .filter(Boolean)
        .join('')

      const salary =
        job.salaryMin || job.salaryMax
          ? `${job.currency} ${job.salaryMin ?? ''}${job.salaryMin && job.salaryMax ? '-' : ''}${job.salaryMax ?? ''} per ${job.salaryPeriod.toLowerCase()}`
          : ''

      return `    <job>
      <title>${cdata(job.title)}</title>
      <date>${job.postedAt.toUTCString()}</date>
      <referencenumber>${cdata(job.id)}</referencenumber>
      <url>${cdata(url)}</url>
      <company>${cdata(job.company.name)}</company>
      <city>${cdata(job.workMode === 'REMOTE' ? 'Remote' : job.city)}</city>
      <country>${cdata(job.country)}</country>
      <jobtype>${cdata(job.employment.toLowerCase().replace('_', ''))}</jobtype>
      <category>${cdata(job.category?.name ?? 'General')}</category>
      <experience>${cdata(job.experience)}</experience>
      <remote>${job.workMode === 'REMOTE' ? 'Yes' : 'No'}</remote>
      ${salary ? `<salary>${cdata(salary)}</salary>` : ''}
      <description>${cdata(description)}</description>
    </job>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher>${site.name}</publisher>
  <publisherurl>${site.url}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</source>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  })
}

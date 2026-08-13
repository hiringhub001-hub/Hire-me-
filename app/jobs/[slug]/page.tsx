import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { getJobBySlug, getSimilarJobs } from '@/features/jobs/queries'
import { JobCard } from '@/features/jobs/job-card'
import { SourceBadge } from '@/features/jobs/job-card'
import { ApplyForm } from '@/features/jobs/apply-form'
import { SaveJobButton } from '@/features/jobs/save-job-button'
import { ShareJob } from '@/features/jobs/share-job'
import { defaultFaqs, enrichJob } from '@/lib/enrich'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/lib/seo'
import { absoluteUrl, site } from '@/lib/site'
import {
  csv,
  educationLabels,
  employmentLabels,
  experienceLabels,
  formatDate,
  formatSalary,
  lines,
  timeAgo,
  workModeLabels,
} from '@/lib/utils'
import { AdSlot } from '@/components/ad-slot'
import { Badge, Breadcrumbs, Card, Container, JsonLd, Section } from '@/components/ui'

export const revalidate = 1800

export async function generateStaticParams() {
  const jobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
    take: 100,
  })
  return jobs.map((job) => ({ slug: job.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const job = await getJobBySlug(slug)
  if (!job) return buildMetadata({ title: 'Job not found', description: '', path: `/jobs/${slug}`, noIndex: true })

  const place = job.workMode === 'REMOTE' ? `Remote, ${job.country}` : `${job.city}, ${job.country}`
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod)

  return buildMetadata({
    title: `${job.title} at ${job.company.name} — ${place}`,
    description: `${job.title} at ${job.company.name}, ${place}${salary ? `, ${salary}` : ''}. Read the required skills, salary context, interview preparation and career path before you apply.`,
    path: `/jobs/${job.slug}`,
    type: 'article',
    publishedTime: job.postedAt.toISOString(),
    modifiedTime: job.updatedAt.toISOString(),
  })
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await getJobBySlug(slug)
  if (!job) notFound()

  const session = await getSession()
  const [similar, saved] = await Promise.all([
    getSimilarJobs(job),
    session
      ? prisma.savedJob.findUnique({
          where: { userId_jobId: { userId: session.userId, jobId: job.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ])

  const enriched = enrichJob(job)
  const faqs = job.faqs.length
    ? job.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))
    : defaultFaqs(job)

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod)
  const place = job.workMode === 'REMOTE' ? `Remote — ${job.country}` : `${job.city}, ${job.country}`
  const path = `/jobs/${job.slug}`

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Jobs', href: '/jobs' },
    ...(job.category ? [{ name: job.category.name, href: `/jobs?category=${job.category.slug}` }] : []),
    { name: job.title, href: path },
  ]

  // JobPosting structured data. `directApply` reflects whether the candidate
  // completes the application on this site, which Google asks us to state.
  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: [
      job.description,
      'Responsibilities: ' + lines(job.responsibilities).join('; '),
      'Requirements: ' + lines(job.requirements).join('; '),
    ].join('\n\n'),
    datePosted: job.postedAt.toISOString(),
    ...(job.expiresAt ? { validThrough: job.expiresAt.toISOString() } : {}),
    employmentType: job.employment,
    directApply: job.source === 'DIRECT' && job.allowInternal,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.name,
      sameAs: job.company.website ?? undefined,
    },
    jobLocation:
      job.workMode === 'REMOTE'
        ? undefined
        : {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.city,
              addressCountry: job.country,
            },
          },
    ...(job.workMode === 'REMOTE'
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: { '@type': 'Country', name: job.country },
        }
      : {}),
    ...(job.salaryMin || job.salaryMax
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.currency,
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salaryMin ?? undefined,
              maxValue: job.salaryMax ?? undefined,
              unitText: job.salaryPeriod,
            },
          },
        }
      : {}),
    skills: job.skills,
    url: absoluteUrl(path),
  }

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={jobPostingJsonLd} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        <JsonLd data={faqJsonLd(faqs)} />

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
          <article>
            {/* Header ---------------------------------------------------- */}
            <header className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={job.source} sourceName={job.sourceName} />
                {job.featured ? <Badge tone="warning">Featured</Badge> : null}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Posted {timeAgo(job.postedAt)}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {job.title}
              </h1>

              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                <Link
                  href={`/company/${job.company.slug}`}
                  className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {job.company.name}
                </Link>
                {' · '}
                {place}
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Salary', value: salary ?? 'Not stated' },
                  { label: 'Job type', value: employmentLabels[job.employment] ?? job.employment },
                  { label: 'Level', value: experienceLabels[job.experience] ?? job.experience },
                  { label: 'Location type', value: workModeLabels[job.workMode] ?? job.workMode },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Apply actions. No advertisement is permitted in this block. */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {job.externalUrl ? (
                  <a
                    href={job.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700"
                  >
                    Apply on {job.sourceName ?? 'the employer site'}
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : (
                  <a
                    href="#apply"
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-brand-600 px-6 font-semibold text-white transition hover:bg-brand-700"
                  >
                    Apply for this job
                  </a>
                )}
                <SaveJobButton
                  jobId={job.id}
                  saved={Boolean(saved)}
                  signedIn={Boolean(session)}
                  pathname={path}
                />
              </div>

              {job.externalUrl ? (
                <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  This role is hosted on {job.sourceName}. The Apply button opens the
                  employer&apos;s own application page there — CareerHub does not collect your
                  application for this listing.
                  {job.allowInternal
                    ? ' You can also send an application through CareerHub using the form below.'
                    : ''}
                </p>
              ) : null}
            </header>

            {/* Our summary ---------------------------------------------- */}
            <section className="mt-8" aria-labelledby="summary-heading">
              <h2
                id="summary-heading"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                What this role actually involves
              </h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-brand-600 dark:text-brand-400">
                CareerHub analysis
              </p>
              <p className="prose-content mt-3">{enriched.summary}</p>
            </section>

            {/* Employer description -------------------------------------- */}
            <section className="mt-10" aria-labelledby="description-heading">
              <h2 id="description-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                About the job
              </h2>
              <div className="prose-content">
                <p>{job.description}</p>

                <h3>Responsibilities</h3>
                <ul>
                  {lines(job.responsibilities).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <h3>Requirements</h3>
                <ul>
                  {lines(job.requirements).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                {lines(job.benefits).length ? (
                  <>
                    <h3>Benefits</h3>
                    <ul>
                      {lines(job.benefits).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {job.education ? (
                  <p>
                    <strong>Minimum education:</strong>{' '}
                    {educationLabels[job.education] ?? job.education}
                  </p>
                ) : null}
              </div>
            </section>

            {/* Skills breakdown ------------------------------------------ */}
            {enriched.skillGuides.length ? (
              <section className="mt-10" aria-labelledby="skills-heading">
                <h2 id="skills-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                  The skills that will be tested, explained
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Written by our editorial team, not taken from the listing.
                </p>
                <div className="mt-4 space-y-4">
                  {enriched.skillGuides.map((skill) => (
                    <Card key={skill.key}>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{skill.label}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200">On the job:</strong>{' '}
                        {skill.whatItMeans}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200">
                          How it is assessed:
                        </strong>{' '}
                        {skill.howItIsAssessed}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200">On your CV:</strong>{' '}
                        {skill.evidenceTip}
                      </p>
                    </Card>
                  ))}
                </div>
                {enriched.otherSkills.length ? (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    Also listed: {enriched.otherSkills.join(', ')}.
                  </p>
                ) : null}
              </section>
            ) : null}

            <AdSlot placement="article-inline" />

            {/* Salary insight -------------------------------------------- */}
            <section className="mt-10" aria-labelledby="salary-heading">
              <h2 id="salary-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Salary insight
              </h2>
              <p className="prose-content mt-3">{enriched.salaryInsight}</p>
              <p className="mt-3 text-sm">
                <Link href="/salary" className="text-brand-600 hover:underline">
                  Browse our salary guides →
                </Link>
              </p>
            </section>

            {/* Career path ----------------------------------------------- */}
            <section className="mt-10" aria-labelledby="path-heading">
              <h2 id="path-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Where this role leads
              </h2>
              <ol className="mt-4 space-y-3">
                {enriched.careerPath.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Application advice ---------------------------------------- */}
            <section className="mt-10" aria-labelledby="resume-heading">
              <h2 id="resume-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                How to apply for this role well
              </h2>

              <h3 className="mt-5 font-semibold text-slate-900 dark:text-white">
                Tailoring your CV
              </h3>
              <ul className="prose-content mt-2">
                {enriched.resumeAdvice.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3 className="mt-6 font-semibold text-slate-900 dark:text-white">
                Your cover letter
              </h3>
              <ul className="prose-content mt-2">
                {enriched.coverLetterTips.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3 className="mt-6 font-semibold text-slate-900 dark:text-white">
                Before you hit send
              </h3>
              <ul className="prose-content mt-2">
                {enriched.applicationChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <p className="mt-4 text-sm">
                <Link href="/tools/resume-builder" className="text-brand-600 hover:underline">
                  Build a CV with our free builder →
                </Link>
              </p>
            </section>

            {/* Interview prep -------------------------------------------- */}
            <section className="mt-10" aria-labelledby="interview-heading">
              <h2 id="interview-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Interview preparation
              </h2>
              <ul className="prose-content mt-2">
                {enriched.interviewPrep.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                <Link href="/interview" className="text-brand-600 hover:underline">
                  Read the full interview guides →
                </Link>
              </p>
            </section>

            {/* Certifications -------------------------------------------- */}
            {enriched.certifications.length ? (
              <section className="mt-10" aria-labelledby="cert-heading">
                <h2 id="cert-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                  Certifications and registration
                </h2>
                <ul className="prose-content mt-2">
                  {enriched.certifications.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Industry -------------------------------------------------- */}
            <section className="mt-10" aria-labelledby="industry-heading">
              <h2 id="industry-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Industry context
              </h2>
              <p className="prose-content mt-3">{enriched.industryOverview}</p>
              <p className="prose-content mt-3">{job.company.description}</p>
              <p className="mt-3 text-sm">
                <Link href={`/company/${job.company.slug}`} className="text-brand-600 hover:underline">
                  More about {job.company.name} →
                </Link>
              </p>
            </section>

            {/* FAQ ------------------------------------------------------- */}
            <section className="mt-10" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Frequently asked questions
              </h2>
              <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-slate-900 dark:text-white">
                      {faq.question}
                      <span className="text-slate-400 transition group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* Apply form ------------------------------------------------ */}
            {job.allowInternal ? (
              <section id="apply" className="mt-12 scroll-mt-20" aria-labelledby="apply-heading">
                <Card>
                  <h2 id="apply-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                    Apply for this job
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Your details go to {job.company.name}. Applying takes about ten minutes.
                  </p>
                  <div className="mt-5">
                    <ApplyForm
                      jobId={job.id}
                      jobTitle={job.title}
                      defaults={
                        session ? { fullName: session.name, email: session.email } : undefined
                      }
                    />
                  </div>
                </Card>
              </section>
            ) : (
              <section id="apply" className="mt-12 scroll-mt-20">
                <Card>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    How to apply for this role
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {job.company.name} takes applications for this role on{' '}
                    {job.sourceName ?? 'their own site'}. Use the Apply button at the top of this
                    page — it opens their application form directly. Save the job here first if you
                    want to track it in your dashboard.
                  </p>
                  {job.externalUrl ? (
                    <a
                      href={job.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700"
                    >
                      Apply on {job.sourceName ?? 'the employer site'}
                    </a>
                  ) : null}
                </Card>
              </section>
            )}

            {/* Share ----------------------------------------------------- */}
            <section className="mt-12" aria-labelledby="share-heading">
              <h2 id="share-heading" className="text-lg font-bold text-slate-900 dark:text-white">
                Know someone right for this role?
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Share the listing — they land on this page with the full description and can apply
                from here.
              </p>
              <div className="mt-4">
                <ShareJob url={absoluteUrl(path)} title={job.title} company={job.company.name} />
              </div>
            </section>

            <AdSlot placement="article-end" />

            {/* Similar jobs ---------------------------------------------- */}
            {similar.length ? (
              <section className="mt-12" aria-labelledby="similar-heading">
                <h2 id="similar-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                  Similar jobs
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {similar.map((item) => (
                    <JobCard key={item.id} job={item} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Related reading ------------------------------------------- */}
            <section className="mt-12" aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-xl font-bold text-slate-900 dark:text-white">
                Related reading
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/career/how-to-write-a-resume" className="text-brand-600 hover:underline">
                    How to write a resume that survives the first six seconds
                  </Link>
                </li>
                <li>
                  <Link href="/interview/behavioural-interview-questions" className="text-brand-600 hover:underline">
                    Behavioural interview questions and how to answer them
                  </Link>
                </li>
                <li>
                  <Link href="/career/how-to-negotiate-salary" className="text-brand-600 hover:underline">
                    How to negotiate salary without losing the offer
                  </Link>
                </li>
                <li>
                  <Link href="/blog/how-to-spot-a-job-scam" className="text-brand-600 hover:underline">
                    How to spot a job scam before it costs you
                  </Link>
                </li>
              </ul>
            </section>

            <p className="mt-10 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Listing last updated {formatDate(job.updatedAt)}. The analysis, skills breakdown,
              salary insight and interview guidance on this page were written by the {site.name}{' '}
              editorial team and are independent of the employer. Always verify pay and conditions
              with the employer before accepting an offer.
            </p>
          </article>

          {/* Sidebar --------------------------------------------------- */}
          <aside className="mt-10 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  {job.company.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {job.company.industry}
                  {job.company.size ? ` · ${job.company.size}` : ''}
                </p>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {job.company.description}
                </p>
                <Link
                  href={`/company/${job.company.slug}`}
                  className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
                >
                  View company profile →
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Key skills
                </h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {csv(job.skills).map((skill) => (
                    <li key={skill}>
                      <Link
                        href={`/jobs?q=${encodeURIComponent(skill)}`}
                        className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {skill}
                      </Link>
                    </li>
                  ))}
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

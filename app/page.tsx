import Link from 'next/link'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getFeaturedJobs, getJobFacets } from '@/features/jobs/queries'
import { JobCardList } from '@/features/jobs/job-card'
import { HomeSearch } from '@/features/jobs/home-search'
import { Badge, ButtonLink, Card, Container, JsonLd, Section } from '@/components/ui'
import { site } from '@/lib/site'
import { buildMetadata, faqJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'

/**
 * The homepage previously inherited the root layout's generic title. Searchers
 * do not type a brand they have never heard of — they type the job and the
 * place, so the title leads with that and carries the brand second.
 */
export const metadata: Metadata = buildMetadata({
  title: 'CareerHub — Jobs in Nigeria, UK and Remote | Career Guides & CV Tools',
  description:
    'Search thousands of jobs in Nigeria, the UK and remote roles worldwide. Apply in one place with Easy Apply, get free CV and cover letter tools, salary guides and interview preparation. Free for job seekers.',
  path: '/',
})

// Revalidate hourly: the homepage is the most requested page and its content
// changes only when new jobs are published.
export const revalidate = 3600

/**
 * Answers to the queries people actually type. Marked up as FAQPage so Google
 * can surface them directly, and genuinely useful on the page either way.
 */
const homeFaqs = [
  {
    question: 'How do I find a job in Nigeria?',
    answer:
      'Search by skill rather than only by job title — the same work is advertised under many different names, and skills match what employers actually list as requirements. Filter by location or work type, then read the skills breakdown on the job page before you write anything, because it tells you which requirements the interview is likely to focus on.',
  },
  {
    question: 'Which jobs can I apply for with no experience?',
    answer:
      'Filter to entry level and internships. Employers hiring at that level are recruiting for attitude and reliability rather than a track record, so a short, specific covering note about why you want that particular job counts for more than a long CV.',
  },
  {
    question: 'Are remote jobs on CareerHub genuinely remote?',
    answer:
      'Each listing states whether it is remote, hybrid or on-site, and remote roles show which country the employer can hire in. Check that before applying — a role advertised as remote is often restricted to one country for tax and employment reasons.',
  },
  {
    question: 'Is CareerHub free for job seekers?',
    answer:
      'Yes, entirely. There is no premium tier, no paywalled guidance and no fee to apply. We are funded by advertising. No legitimate employer or job board will ever ask you to pay to apply for a job.',
  },
  {
    question: 'What is Easy Apply?',
    answer:
      'Jobs marked Easy Apply are applied for on CareerHub in a couple of taps, using the CV saved on your profile. Other listings send you to the employer\'s own site or their LinkedIn or Indeed page — those are badged so you know before you click.',
  },
  {
    question: 'How do I know a job advert is real?',
    answer:
      'Every employer account is reviewed before its listings go live, and we remove anything that asks candidates for money, hides the employer\'s identity, or requests bank or identity documents before a written offer. If something looks wrong, report it and we will investigate the same day.',
  },
]

export default async function HomePage() {
  const session = await getSession()
  const isRecruiter = session?.role === 'EMPLOYER' || session?.role === 'ADMIN'
  const isSeeker = session?.role === 'CANDIDATE'

  const [jobs, facets, guides] = await Promise.all([
    getFeaturedJobs(6),
    getJobFacets(),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: { slug: true, kind: true, title: true, excerpt: true, readMinutes: true, category: true },
    }),
  ])

  const kindPath = { BLOG: '/blog', CAREER: '/career', INTERVIEW: '/interview', SALARY: '/salary' }

  return (
    <>
      {/* Hero ------------------------------------------------------------ */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <Container className="py-10 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
              {facets.total} open roles · {facets.remote} remote
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Find the job, then actually get it
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Search roles from employers hiring directly and from LinkedIn, Indeed and other
              boards — all in one place. Every listing comes with our own breakdown of the skills,
              the interview, and what the pay should be.
            </p>

            <div className="mt-7">
              <HomeSearch />
            </div>

            {/* Two clear entry points, exactly as a job board should have.
                Hidden once you are signed in, because the choice is made. */}
            {!session ? (
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <ButtonLink href="/signup?role=candidate" size="lg" className="sm:w-56">
                  I am a job seeker
                </ButtonLink>
                <ButtonLink
                  href="/signup?role=employer"
                  variant="outline"
                  size="lg"
                  className="sm:w-56"
                >
                  I am a recruiter
                </ButtonLink>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {['Remote', 'Entry level', 'Internship', 'Part-time'].map((label, index) => {
                const params = ['workMode=REMOTE', 'experience=ENTRY', 'employment=INTERNSHIP', 'employment=PART_TIME']
                return (
                  <Link
                    key={label}
                    href={`/jobs?${params[index]}`}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Why this is not just a job board -------------------------------- */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Every listing, explained',
                body: 'We add a plain-English summary, the skills that actually get tested, a likely career path and interview preparation to every job page — written by us, not copied from the advert.',
              },
              {
                title: 'One place to apply',
                body: 'Apply directly through CareerHub where the employer allows it, or go straight to their LinkedIn or Indeed page. Either way you can save the role and track it from your dashboard.',
              },
              {
                title: 'Free for job seekers, always',
                body: 'No fees, no premium tier for candidates, no paywalled guides. We review every employer account before their listings go live and remove anything that asks candidates for money.',
              },
            ].map((item) => (
              <Card key={item.title}>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Latest jobs ----------------------------------------------------- */}
      <Section className="pt-0">
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                Latest jobs
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Updated continuously from direct employers and partner boards.
              </p>
            </div>
            <ButtonLink href="/jobs" variant="outline" size="sm" className="shrink-0">
              View all
            </ButtonLink>
          </div>
          <JobCardList jobs={jobs} />
        </Container>
      </Section>

      {/* Categories ------------------------------------------------------ */}
      <Section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
        <Container>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
            Browse by industry
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Each category page explains what employers in that sector screen for and links to the
            relevant guides.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facets.categories.map((category) => (
              <Link
                key={category.slug}
                href={`/jobs/category/${category.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {category.name}
                  </span>
                  <Badge>{category._count.jobs}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Guides ---------------------------------------------------------- */}
      <Section>
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                From the career centre
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Written in house by recruiters, hiring managers and coaches.
              </p>
            </div>
            <ButtonLink href="/career" variant="outline" size="sm" className="shrink-0">
              All guides
            </ButtonLink>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {guides.map((guide) => (
              <Card key={`${guide.kind}-${guide.slug}`} className="flex flex-col">
                <Badge tone="brand" className="w-fit">
                  {guide.category}
                </Badge>
                <h3 className="mt-3 font-semibold leading-snug text-slate-900 dark:text-white">
                  <Link
                    href={`${kindPath[guide.kind as keyof typeof kindPath]}/${guide.slug}`}
                    className="hover:underline"
                  >
                    {guide.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
                  {guide.excerpt}
                </p>
                <p className="mt-3 text-xs text-slate-500">{guide.readMinutes} min read</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Common questions ------------------------------------------------ */}
      <Section className="pt-0">
        <Container className="max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
            Common questions about finding a job
          </h2>
          <JsonLd data={faqJsonLd(homeFaqs)} />
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {homeFaqs.map((faq) => (
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
        </Container>
      </Section>

      {/* Tools + employers ----------------------------------------------- */}
      <Section className="pt-0">
        <Container>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="bg-brand-600 text-white dark:bg-brand-700">
              <h2 className="text-xl font-bold">Free tools for your search</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-50">
                Build a CV that parses correctly, draft a cover letter that is not generic, and
                check how well you match a role before you apply. No account required.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/tools/resume-builder" variant="secondary" size="sm">
                  Resume builder
                </ButtonLink>
                <ButtonLink href="/tools/cover-letter-builder" variant="secondary" size="sm">
                  Cover letter builder
                </ButtonLink>
                <ButtonLink href="/tools/job-match" variant="secondary" size="sm">
                  Job match score
                </ButtonLink>
              </div>
            </Card>

            {/* Job seekers are never shown a hiring call to action — they get
                their own next step instead. */}
            {isSeeker ? (
              <Card>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Keep your search moving
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Set an alert so new matching roles reach you first — applying in the first few
                  days measurably improves your odds — and keep every application in one place so
                  you know when to follow up.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ButtonLink href="/job-alerts" size="sm">
                    Create a job alert
                  </ButtonLink>
                  <ButtonLink href="/dashboard/applications" variant="outline" size="sm">
                    My applications
                  </ButtonLink>
                </div>
              </Card>
            ) : (
              <Card>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hiring?</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Post a role on {site.name} and reach candidates who arrive having read the skills
                  breakdown and interview guide for your job. Listings are reviewed before they go
                  live, which keeps the quality of applications high.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ButtonLink href={isRecruiter ? '/employer/post-job' : '/signup?role=employer'} size="sm">
                    Post a job
                  </ButtonLink>
                  <ButtonLink href="/for-employers" variant="outline" size="sm">
                    How it works
                  </ButtonLink>
                </div>
              </Card>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}

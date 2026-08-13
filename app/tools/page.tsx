import Link from 'next/link'
import type { Metadata } from 'next'

import { Breadcrumbs, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Free career tools',
  description:
    'Free tools for your job search: a resume builder that produces an ATS-friendly CV, a cover letter builder, and a job match score that shows your skill gaps.',
  path: '/tools',
})

const tools = [
  {
    href: '/tools/resume-builder',
    title: 'Resume builder',
    description:
      'Build a single-column CV that parses correctly in applicant tracking systems, with prompts that push you towards results rather than duty statements. Print or save as PDF straight from your browser.',
  },
  {
    href: '/tools/cover-letter-builder',
    title: 'Cover letter builder',
    description:
      'Answer four questions and get a structured draft in the format hiring managers actually read: role named up front, one concrete example, evidence you researched the company, clear close.',
  },
  {
    href: '/tools/job-match',
    title: 'Job match score',
    description:
      'Paste a job advert and your skills to see which requirements you match, which you are missing, and what to emphasise in your application.',
  },
]

export default function ToolsPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Free tools', href: '/tools' },
  ]

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader
          title="Free career tools"
          intro="No account needed, no watermark, no export fee. Everything you type stays in your browser — we do not upload or store the contents of these tools."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.href} className="flex flex-col">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                <Link href={tool.href} className="hover:underline">
                  {tool.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {tool.description}
              </p>
              <Link
                href={tool.href}
                className="mt-4 text-sm font-medium text-brand-600 hover:underline"
              >
                Open tool →
              </Link>
            </Card>
          ))}
        </div>

        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            How to use these together
          </h2>
          <div className="prose-content mt-3 text-base">
            <p>
              The order that works: find a role you want, run it through the job match tool to see
              which requirements you actually meet, then build the CV around the ones you match and
              write the cover letter around the single strongest example.
            </p>
            <p>
              The most common mistake is writing one CV and sending it everywhere. The second most
              common is rewriting it from scratch for every application. Neither is necessary — keep
              a master version with every bullet you have earned, and assemble each application by
              reordering and deleting.
            </p>
            <p>
              Our <Link href="/career/how-to-write-a-resume">CV writing guide</Link> covers the
              method in full, and the{' '}
              <Link href="/blog/ats-friendly-cv-formatting">ATS formatting guide</Link> explains
              which formatting rules genuinely matter and which are myths.
            </p>
          </div>
        </section>
      </Container>
    </Section>
  )
}

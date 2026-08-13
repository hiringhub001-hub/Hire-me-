import Link from 'next/link'
import type { Metadata } from 'next'

import { CoverLetterBuilder } from '@/features/tools/cover-letter-builder'
import { Breadcrumbs, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Free cover letter builder',
  description:
    'Answer four questions and get a structured cover letter draft: role named up front, one concrete example with a number, evidence you researched the company, and a clear close.',
  path: '/tools/cover-letter-builder',
})

export default function CoverLetterBuilderPage() {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Free tools', href: '/tools' },
    { name: 'Cover letter builder', href: '/tools/cover-letter-builder' },
  ]

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        <PageHeader
          title="Cover letter builder"
          intro="Four questions, one structured draft. Nothing you type is uploaded — the letter is assembled in your browser."
        />

        <CoverLetterBuilder />

        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            What a cover letter is actually for
          </h2>
          <div className="prose-content mt-3 text-base">
            <p>
              A CV lists what you have done. A cover letter argues why those particular things
              matter for this particular role. That is the whole job, and it is why a generic letter
              is worse than no letter — it takes up a reviewer&apos;s time without making an
              argument.
            </p>
            <h3>The structure that works</h3>
            <ol>
              <li>
                <strong>Name the role in the first sentence.</strong> Reviewers are often handling
                several vacancies at once.
              </li>
              <li>
                <strong>Take one requirement and answer it with evidence.</strong> This is the
                paragraph that decides whether you get read to the end. One example, with a number,
                described concretely.
              </li>
              <li>
                <strong>Show you know something specific about them.</strong> Anything that could be
                said about any employer should be cut.
              </li>
              <li>
                <strong>Close with availability and a next step.</strong> Short, direct, no
                pleading.
              </li>
            </ol>
            <h3>What to leave out</h3>
            <ul>
              <li>
                A summary of your CV. The reviewer has it attached — repeating it wastes the one
                page where you could make an argument.
              </li>
              <li>
                Adjectives about yourself. &ldquo;Passionate, driven, hard-working&rdquo; is
                unverifiable and every applicant writes it.
              </li>
              <li>Anything negative about a current or former employer.</li>
              <li>More than about 300 words. Three or four short paragraphs is right.</li>
            </ul>
            <p>
              For the full method, read{' '}
              <Link href="/career/how-to-write-a-resume">how to write a resume</Link> — the same
              evidence-first principle applies to both documents.
            </p>
          </div>
        </section>
      </Container>
    </Section>
  )
}

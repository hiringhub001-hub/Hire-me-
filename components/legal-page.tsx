import Link from 'next/link'

import { Breadcrumbs, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd } from '@/lib/seo'
import { site } from '@/lib/site'
import type { Section as ContentSection } from '@/content/posts/types'

/**
 * Shared shell for policy and informational pages. Keeps every one of them
 * consistently structured, dated and internally linked.
 */
export function LegalPage({
  title,
  href,
  intro,
  updated = 'August 2026',
  sections,
  children,
}: {
  title: string
  href: string
  intro: string
  updated?: string
  sections: ContentSection[]
  children?: React.ReactNode
}) {
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: title, href },
  ]

  return (
    <Section className="pt-6">
      <Container className="max-w-3xl">
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader title={title} intro={intro} />
        <p className="-mt-4 text-sm text-slate-500 dark:text-slate-400">Last updated: {updated}</p>

        <div className="prose-content mt-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets?.length ? (
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.steps?.length ? (
                <ol>
                  {section.steps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              ) : null}
            </section>
          ))}
        </div>

        {children}

        <div className="mt-10 rounded-2xl border border-slate-200 p-5 text-sm dark:border-slate-800">
          <p className="text-slate-700 dark:text-slate-300">
            Questions about this page? Email{' '}
            <a href={`mailto:${site.email}`} className="text-brand-600 hover:underline">
              {site.email}
            </a>{' '}
            or use the{' '}
            <Link href="/contact" className="text-brand-600 hover:underline">
              contact form
            </Link>
            . We reply to policy questions within five working days.
          </p>
        </div>
      </Container>
    </Section>
  )
}

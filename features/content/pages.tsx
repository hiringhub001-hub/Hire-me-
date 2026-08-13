import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { kindLabels, kindPaths } from '@/content/posts'
import {
  getPost,
  getPostsByKind,
  getRelatedPosts,
  parseBody,
  type PostKind,
} from '@/features/content/queries'
import { AdSlot } from '@/components/ad-slot'
import { Badge, Breadcrumbs, Card, Container, JsonLd, PageHeader, Section } from '@/components/ui'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/lib/seo'
import { absoluteUrl, site } from '@/lib/site'
import { csv, formatDate } from '@/lib/utils'

type Copy = { title: string; intro: string; description: string }

export const kindCopy: Record<PostKind, Copy> = {
  CAREER: {
    title: 'Career advice',
    intro:
      'Practical guides on writing a CV, negotiating pay, changing career and starting a new job well — written by recruiters and coaches who do this work for a living.',
    description:
      'Free career advice from working recruiters and career coaches: CV writing, salary negotiation, career change, remote work and your first 90 days in a new job.',
  },
  INTERVIEW: {
    title: 'Interview guides',
    intro:
      'What each stage of the process assesses, the questions that actually get asked, and how to prepare for them without memorising a script.',
    description:
      'Role-by-role interview guides covering the real process, the questions asked at each stage, and how to prepare answers that hold up to follow-up questions.',
  },
  SALARY: {
    title: 'Salary guides',
    intro:
      'What roles pay by experience level and location, what moves the number, and how to work out your own figure before a negotiation.',
    description:
      'Salary guides by role and experience level, including what shifts pay bands, what to count beyond base salary, and how to research your own market rate.',
  },
  BLOG: {
    title: 'Blog',
    intro:
      'Notes on the job market, hiring practice and search strategy from the CareerHub editorial team.',
    description:
      'Articles on job searching, hiring practice, recruitment fraud, application tracking systems and how to run an effective search across multiple job boards.',
  },
}

/* -------------------------------------------------------------------------- */
/* Index page                                                                  */
/* -------------------------------------------------------------------------- */

export function buildIndexMetadata(kind: PostKind): Metadata {
  const copy = kindCopy[kind]
  return buildMetadata({
    title: copy.title,
    description: copy.description,
    path: kindPaths[kind],
  })
}

export async function ContentIndexPage({ kind }: { kind: PostKind }) {
  const posts = await getPostsByKind(kind)
  const copy = kindCopy[kind]
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: copy.title, href: kindPaths[kind] },
  ]

  const categories = [...new Set(posts.map((post) => post.category))]

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />

        <PageHeader eyebrow={site.name} title={copy.title} intro={copy.intro} />

        {categories.length > 1 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} tone="neutral">
                {category}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.slug} className="flex flex-col">
              <Badge tone="brand" className="w-fit">
                {post.category}
              </Badge>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                <Link href={`${kindPaths[kind]}/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {post.excerpt}
              </p>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {post.authorName} · {post.readMinutes} min read ·{' '}
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              </p>
            </Card>
          ))}
        </div>

        {kind === 'SALARY' ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              How we produce these figures
            </h2>
            <div className="prose-content mt-2 text-base">
              <p>
                Our salary ranges are compiled from advertised bands on live listings, published
                public-sector pay scales, and industry surveys, then reviewed by a compensation
                specialist. They describe base salary unless stated otherwise.
              </p>
              <p>
                Salary data ages quickly and varies enormously by employer size and location. Treat
                every figure here as a starting point for a conversation, not a valuation of your
                work. Where a guide gives a range in one currency, convert with care — cost of
                living differences usually matter more than the exchange rate.
              </p>
            </div>
          </section>
        ) : null}

        <AdSlot placement="listing-footer" />
      </Container>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/* Article page                                                                */
/* -------------------------------------------------------------------------- */

export async function buildArticleMetadata(kind: PostKind, slug: string): Promise<Metadata> {
  const post = await getPost(kind, slug)
  if (!post) {
    return buildMetadata({
      title: 'Not found',
      description: '',
      path: `${kindPaths[kind]}/${slug}`,
      noIndex: true,
    })
  }
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `${kindPaths[kind]}/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    authors: [post.authorName],
  })
}

export async function ContentArticlePage({ kind, slug }: { kind: PostKind; slug: string }) {
  const post = await getPost(kind, slug)
  if (!post) notFound()

  const { sections, faqs } = parseBody(post.body)
  const related = await getRelatedPosts(kind, slug, post.category)
  const copy = kindCopy[kind]

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: copy.title, href: kindPaths[kind] },
    { name: post.title, href: `${kindPaths[kind]}/${post.slug}` },
  ]

  // Place one ad after roughly the halfway point of a long article only.
  const adAfterSection = sections.length >= 6 ? Math.floor(sections.length / 2) : -1

  return (
    <Section className="pt-6">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <JsonLd data={breadcrumbJsonLd(crumbs)} />
        {faqs.length ? <JsonLd data={faqJsonLd(faqs)} /> : null}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { '@type': 'Person', name: post.authorName, jobTitle: post.authorRole ?? undefined },
            publisher: {
              '@type': 'Organization',
              name: site.name,
              url: site.url,
            },
            mainEntityOfPage: absoluteUrl(`${kindPaths[kind]}/${post.slug}`),
            articleSection: post.category,
            keywords: post.tags,
          }}
        />

        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
          <article>
            <header>
              <Badge tone="brand">{post.category}</Badge>
              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {post.title}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {post.excerpt}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-slate-200 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <span className="font-medium text-slate-900 dark:text-white">
                  {post.authorName}
                </span>
                {post.authorRole ? <span>· {post.authorRole}</span> : null}
                <span>· {post.readMinutes} min read</span>
                <time dateTime={post.publishedAt.toISOString()}>
                  · Published {formatDate(post.publishedAt)}
                </time>
              </div>
            </header>

            {/* Table of contents helps long-form usability and internal linking. */}
            {sections.length > 3 ? (
              <nav aria-label="On this page" className="mt-8 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  On this page
                </h2>
                <ol className="mt-3 space-y-2">
                  {sections.map((section, index) => (
                    <li key={section.heading}>
                      <a
                        href={`#section-${index}`}
                        className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <div className="prose-content mt-8">
              {sections.map((section, index) => (
                <section key={section.heading} id={`section-${index}`}>
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
                  {section.quote ? <blockquote>{section.quote}</blockquote> : null}
                  {index === adAfterSection ? <AdSlot placement="article-inline" /> : null}
                </section>
              ))}
            </div>

            {faqs.length ? (
              <section className="mt-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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
            ) : null}

            <footer className="mt-10 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                About this article
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Written by {post.authorName}
                {post.authorRole ? `, ${post.authorRole}` : ''}, and reviewed before publication
                against our{' '}
                <Link href="/editorial-policy" className="text-brand-600 hover:underline">
                  editorial policy
                </Link>
                . We update guides when the advice materially changes. Last updated{' '}
                {formatDate(post.updatedAt)}. If you think something here is wrong, please{' '}
                <Link href="/contact" className="text-brand-600 hover:underline">
                  tell us
                </Link>
                .
              </p>
              {csv(post.tags).length ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {csv(post.tags).map((tag) => (
                    <li
                      key={tag}
                      className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </footer>

            <AdSlot placement="article-end" />

            {related.length ? (
              <section className="mt-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Related reading</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((item) => (
                    <Card key={`${item.kind}-${item.slug}`}>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
                        {kindLabels[item.kind as keyof typeof kindLabels]}
                      </p>
                      <h3 className="mt-1.5 font-semibold leading-snug text-slate-900 dark:text-white">
                        <Link
                          href={`${kindPaths[item.kind as keyof typeof kindPaths]}/${item.slug}`}
                          className="hover:underline"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                        {item.excerpt}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="mt-10 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Put this into practice
                </h2>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link href="/tools/resume-builder" className="text-brand-600 hover:underline">
                      Free resume builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/tools/cover-letter-builder" className="text-brand-600 hover:underline">
                      Cover letter builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/tools/job-match" className="text-brand-600 hover:underline">
                      Job match score
                    </Link>
                  </li>
                  <li>
                    <Link href="/jobs" className="text-brand-600 hover:underline">
                      Browse open jobs
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

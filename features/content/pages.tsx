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
import { TrackView } from '@/components/track-view'
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from '@/lib/seo'
import { absoluteUrl, site } from '@/lib/site'
import { csv, formatDate } from '@/lib/utils'

type Copy = {
  title: string
  intro: string
  description: string
  /**
   * Standalone guidance for the hub itself.
   *
   * These pages used to be a heading and a grid of cards — 156 words on the
   * interview hub, 167 on the blog. A page whose only content is links to other
   * pages is thin by any measure, and it gave a reader arriving from search
   * nothing to act on. Each hub now answers the question that brought someone
   * to it before sending them anywhere.
   */
  body: { heading: string; paragraphs: string[] }[]
}

export const kindCopy: Record<PostKind, Copy> = {
  CAREER: {
    title: 'Career advice',
    intro:
      'Practical guides on writing a CV, negotiating pay, changing career and starting a new job well — researched against current job adverts and published pay data, and reviewed before they go live.',
    description:
      'Free career advice on CV writing, salary negotiation, career change, remote work and your first 90 days in a new job — researched, dated and reviewed before publication.',
    body: [
      {
        heading: 'Where to start, depending on where you are',
        paragraphs: [
          'If you are applying and hearing nothing back, the problem is usually the CV rather than the number of applications. Start with the CV guide, fix the structure, then send half as many applications with twice the tailoring. Most people find the reply rate moves within a fortnight.',
          'If you are getting interviews but not offers, the gap is in how you talk about your work rather than in the work itself. Our interview guides break down what each stage is actually assessing, which is rarely what candidates assume.',
          'If you have an offer in hand, read the negotiation guide before you reply. The single most expensive mistake in a job search is accepting the first number on the day it arrives.',
        ],
      },
      {
        heading: 'What we will not tell you',
        paragraphs: [
          'There is no wording that guarantees an interview, no format that beats every applicant tracking system, and no script that survives a competent interviewer. Anyone selling you those is selling you something.',
          'What does work is unglamorous: a CV that states results rather than duties, applications aimed at roles you can evidence, and preparation specific to the employer in front of you. Every guide here is built on that, and each one says plainly where the advice stops being general and starts depending on your market.',
        ],
      },
      {
        heading: 'How often this changes',
        paragraphs: [
          'Hiring practice moves slowly, but it does move — remote policies, pay transparency rules and screening tools have all shifted in the last few years. We review these guides at least annually and immediately when something material changes, and each article carries the date it was last updated so you can judge for yourself.',
        ],
      },
    ],
  },
  INTERVIEW: {
    title: 'Interview guides',
    intro:
      'What each stage of the process assesses, the questions that actually get asked, and how to prepare for them without memorising a script.',
    description:
      'Role-by-role interview guides covering the real process, the questions asked at each stage, and how to prepare answers that hold up to follow-up questions.',
    body: [
      {
        heading: 'What interviews are actually testing',
        paragraphs: [
          'Almost every interview is trying to answer three questions: can you do the work, will you keep doing it, and can the team stand working with you. Nearly every question, however oddly phrased, is a proxy for one of those. Recognising which one you are being asked about is most of the skill.',
          'That is why memorised answers perform badly. An interviewer who asks a follow-up finds the edge of a rehearsed story almost immediately, and the follow-up is where the assessment actually happens.',
        ],
      },
      {
        heading: 'Preparing without a script',
        paragraphs: [
          'Prepare material, not answers. Six or seven concrete pieces of work you can describe in detail — what the situation was, what you decided, what happened, what you would do differently — will cover the overwhelming majority of competency questions between them, and they hold up under questioning because they are true.',
          'Then prepare for the specific employer: what they sell, who their customers are, what pressure their sector is under, and what the job advert implies about why this role exists now. Candidates who research the role rather than only the company interview noticeably better.',
        ],
      },
      {
        heading: 'The questions you ask',
        paragraphs: [
          'Being asked "any questions for us?" is part of the assessment, not the wind-down. Ask about the work: what the first three months look like, how the team measures whether this role is going well, what the last person in it found hardest. Those tell you whether you want the job, which matters as much as whether they want you.',
          'Avoid questions whose answers are on the careers page. It reads as though you did not look.',
        ],
      },
    ],
  },
  SALARY: {
    title: 'Salary guides',
    intro:
      'What roles pay by experience level and location, what moves the number, and how to work out your own figure before a negotiation.',
    description:
      'Salary guides by role and experience level, including what shifts pay bands, what to count beyond base salary, and how to research your own market rate.',
    body: [
      {
        heading: 'How to read these guides',
        paragraphs: [
          'Every range here is assembled from advertised pay and published pay scales, not from self-reported figures. That makes them conservative: advertised bands tend to sit slightly below what a strong candidate eventually agrees, and many employers still advertise no figure at all.',
          'Treat the range as the middle of a conversation rather than the end of one. Where a guide covers several countries, the difference between them is usually bigger than the difference between experience levels within one of them.',
        ],
      },
      {
        heading: 'Working out your own number',
        paragraphs: [
          'Decide your figure before anyone asks for it. Take the advertised range for your role and location, place yourself in it honestly against the requirements listed, and write down the number you would accept without resentment. That is your floor, and it is far easier to hold a number you have already justified to yourself.',
          'Then count what sits beside base pay: bonus and how often it actually pays out, pension contribution, leave, notice period, and whatever the role costs you in commuting or equipment. Two offers with identical salaries are routinely thousands apart once those are counted.',
        ],
      },
      {
        heading: 'When pay is not advertised',
        paragraphs: [
          'A listing with no salary is common and is not a red flag by itself. Ask for the band at the end of the first screening call — most recruiters will share it, and it saves both sides weeks. If you are pushed for your expectations first, give a range whose bottom you would genuinely accept.',
        ],
      },
    ],
  },
  BLOG: {
    title: 'Blog',
    intro:
      'Notes on the job market, hiring practice and search strategy from the CareerHub editorial team.',
    description:
      'Articles on job searching, hiring practice, recruitment fraud, application tracking systems and how to run an effective search across multiple job boards.',
    body: [
      {
        heading: 'What we write about here',
        paragraphs: [
          'The guides on this site answer settled questions: how to write a CV, how to prepare for an interview, what a role pays. This section is for things that are still moving — changes in hiring practice, patterns we see in the listings that pass through the site, and the scams that follow job seekers around.',
          'Job scams in particular are worth your attention. They have become markedly more convincing, they target people at their most vulnerable, and almost all of them break at the same few points. Knowing those points is a five-minute read that can save someone their savings.',
        ],
      },
      {
        heading: 'How we decide what is worth publishing',
        paragraphs: [
          'We publish when we have something specific to say. An article that could apply equally to any role in any country is not worth your time, and we send those back rather than fill a schedule with them.',
          'Where a claim is contested, or varies between the markets this site covers, we say so rather than presenting one market as universal. Where we get something wrong, we correct it and note what changed.',
        ],
      },
    ],
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

        <div className="prose-content mb-10 max-w-3xl">
          {copy.body.map((block) => (
            <section key={block.heading}>
              <h2>{block.heading}</h2>
              {block.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          All {copy.title.toLowerCase()}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <TrackView
          event="article_view"
          params={{ kind, slug: post.slug, category: post.category, title: post.title }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            // Organization, not Person: our articles are attributed to an
            // editorial desk rather than to a named individual, and claiming a
            // Person that does not exist is exactly the kind of thing structured
            // data reviews penalise.
            author: { '@type': 'Organization', name: post.authorName, url: site.url },
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
                Written by the {post.authorRole ? post.authorRole.toLowerCase() : 'editorial desk'}{' '}
                at {site.name}, and reviewed before publication against our{' '}
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

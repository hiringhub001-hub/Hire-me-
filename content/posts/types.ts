export type Section = {
  heading: string
  /** Paragraphs of body copy. */
  body?: string[]
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[]
  /** Optional numbered list rendered after the bullets. */
  steps?: string[]
  /** Optional pull quote. */
  quote?: string
}

export type ArticleSeed = {
  slug: string
  kind: 'BLOG' | 'CAREER' | 'INTERVIEW' | 'SALARY'
  title: string
  excerpt: string
  category: string
  tags: string[]
  authorName: string
  authorRole: string
  readMinutes: number
  /** ISO date. Seeded posts are spread across recent months. */
  publishedAt: string
  sections: Section[]
  faqs?: { question: string; answer: string }[]
}

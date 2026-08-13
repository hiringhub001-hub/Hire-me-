import { blogArticles } from '@/content/posts/blog'
import { careerArticles } from '@/content/posts/career'
import { interviewArticles } from '@/content/posts/interview'
import { salaryArticles } from '@/content/posts/salary'
import type { ArticleSeed } from '@/content/posts/types'

export const allArticles: ArticleSeed[] = [
  ...careerArticles,
  ...interviewArticles,
  ...salaryArticles,
  ...blogArticles,
]

export type { ArticleSeed, Section } from '@/content/posts/types'

/** Route prefix per content kind — used for links, sitemaps and breadcrumbs. */
export const kindPaths = {
  BLOG: '/blog',
  CAREER: '/career',
  INTERVIEW: '/interview',
  SALARY: '/salary',
} as const

export const kindLabels = {
  BLOG: 'Blog',
  CAREER: 'Career advice',
  INTERVIEW: 'Interview guide',
  SALARY: 'Salary guide',
} as const

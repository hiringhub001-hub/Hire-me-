import type { Metadata } from 'next'

import { ContentIndexPage, buildIndexMetadata } from '@/features/content/pages'

export const revalidate = 3600

export const metadata: Metadata = buildIndexMetadata('SALARY')

export default function Page() {
  return <ContentIndexPage kind="SALARY" />
}

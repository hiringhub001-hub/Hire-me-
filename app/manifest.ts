import type { MetadataRoute } from 'next'

import { site } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.shortName,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1c5df5',
    orientation: 'portrait',
    categories: ['business', 'education', 'productivity'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}

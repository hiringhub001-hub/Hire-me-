import type { MetadataRoute } from 'next'

import { site } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.shortName,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#587898',
    theme_color: '#1c5df5',
    orientation: 'portrait',
    categories: ['business', 'education', 'productivity'],
    icons: [
      { src: '/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

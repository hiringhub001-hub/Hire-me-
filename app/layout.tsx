import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'

import './globals.css'
import { site } from '@/lib/site'
import { getSession } from '@/lib/auth'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/ui'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BottomNav } from '@/components/bottom-nav'
import { ThemeScript } from '@/components/theme-toggle'
import { CookieBanner } from '@/components/cookie-banner'
import { GoogleTag } from '@/components/google-tag'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'jobs',
    'job search',
    'career advice',
    'resume builder',
    'interview questions',
    'salary guide',
    'remote jobs',
  ],
  authors: [{ name: `${site.name} editorial team` }],
  creator: site.name,
  publisher: site.name,
  formatDetection: { telephone: false },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': `${site.url}/rss.xml` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read once here and pass down, so the role-aware nav does not re-read the
  // session in three separate components.
  const session = await getSession()

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Google tag first, so it is present in the served HTML for detection
            and so Consent Mode defaults are set before anything can fire. */}
        <GoogleTag />
        <ThemeScript />
        {site.adsenseClient ? (
          <meta name="google-adsense-account" content={site.adsenseClient} />
        ) : null}
      </head>
      <body className="font-sans">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>

        <SiteHeader />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <SiteFooter role={session?.role ?? null} />
        <BottomNav role={session?.role ?? null} />
        <CookieBanner />

        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />

        {/* Analytics and ads load after the page is interactive so they cannot
            hurt Core Web Vitals. Nothing loads unless the ID is configured. */}
        {site.clarityId ? (
          <Script id="clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${site.clarityId}");`}
          </Script>
        ) : null}

        {site.adsenseClient ? (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`}
          />
        ) : null}
      </body>
    </html>
  )
}

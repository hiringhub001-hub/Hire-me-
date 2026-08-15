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
import { AdSenseScript } from '@/components/adsense-script'

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
  // Google Search Console HTML-tag verification. Declared here rather than as a
  // hand-written <meta> so Next owns the tag and cannot emit a duplicate: this
  // is the root layout, and child metadata merges rather than repeating it.
  verification: {
    google: site.googleSiteVerification,
  },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': `${site.url}/rss.xml` },
  },
  // Social preview defaults for the whole site. Pages built with
  // `buildMetadata` override these with their own title, description and URL;
  // anything that does not — the homepage among them — inherits these rather
  // than being shared with no image at all.
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    site: site.social.twitter,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [site.ogImage],
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
        <AdSenseScript />
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

      </body>
    </html>
  )
}

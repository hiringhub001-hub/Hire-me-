import { site } from '@/lib/site'

/**
 * The AdSense site-verification script.
 *
 * Rendered as a raw <script> at the top of <head>, matching how the Google tag
 * is installed in this project. `next/script` with `afterInteractive` injects
 * the tag only after hydration, which is a common reason a correctly
 * instrumented site still fails Google's automated checks. The script is
 * `async`, so it does not block rendering.
 *
 * This is only the loader — it is what AdSense looks for when reviewing a site.
 * Individual ad units are controlled separately by `site.adsEnabled`, so no ad
 * placements go live until the account is approved.
 */
export function AdSenseScript() {
  if (!site.adsenseClient) return null

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`}
      crossOrigin="anonymous"
    />
  )
}

import { site } from '@/lib/site'

/**
 * The Google tag (gtag.js), rendered into <head> exactly as Google supplies it.
 *
 * Two deliberate choices:
 *
 * 1. Raw <script> tags rather than next/script. Google's tag detection — and
 *    Tag Assistant — looks for the tag in the served HTML. next/script with
 *    `afterInteractive` injects it only after hydration, which is why a site
 *    can be correctly instrumented and still report "tag not detected". Both
 *    scripts are async, so this costs nothing in render-blocking time.
 *
 * 2. Consent Mode v2 defaults are set *before* the tag loads, denying storage
 *    until the visitor accepts. That is what keeps the cookie banner honest:
 *    no analytics or advertising cookies are written until consent, while the
 *    tag itself is still present and measurable. `CookieBanner` calls
 *    gtag('consent', 'update', …) when the choice is made.
 *
 * Renders nothing when NEXT_PUBLIC_GA_ID is unset.
 */
export function GoogleTag() {
  if (!site.gaId) return null

  const consentDefaults = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    // Denied until the visitor chooses. 'wait_for_update' gives the banner a
    // moment to restore a previous choice before any hit is sent.
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      wait_for_update: 500
    });
    try {
      if (localStorage.getItem('cookie-consent') === 'accepted') {
        gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted'
        });
      }
    } catch (e) {}
    gtag('js', new Date());
    gtag('config', '${site.gaId}');
  `

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: consentDefaults }} />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`} />
    </>
  )
}

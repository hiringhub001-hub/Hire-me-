/**
 * Analytics events.
 *
 * A small, closed set of named events so reports stay comparable over time —
 * free-text event names are how analytics accounts become unusable. Nothing is
 * sent unless a GA4 measurement ID is configured and the visitor accepted
 * analytics cookies, so this is safe to call unconditionally.
 */

export type AnalyticsEvent =
  | 'job_search'
  | 'job_view'
  | 'apply_click'
  | 'apply_submitted'
  | 'external_apply_click'
  | 'job_saved'
  | 'job_shared'
  | 'sign_up'
  | 'employer_sign_up'
  | 'job_posted'
  | 'resume_download'
  | 'article_view'
  | 'job_alert_created'

type Params = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Params | ConsentParams) => void
    dataLayer?: unknown[]
  }
}

type ConsentParams = Record<string, 'granted' | 'denied' | number>

/**
 * Fire-and-forget. Never throws, never blocks the interaction it describes.
 *
 * Consent is enforced by Google Consent Mode rather than by refusing to send:
 * the tag ships with storage denied, so until the visitor accepts, these events
 * are cookieless pings that write nothing to their device. That keeps the
 * cookie banner's promise while still giving usable measurement.
 */
export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined' || !window.gtag) return

  try {
    window.gtag('event', event, params)
  } catch {
    // Analytics must never break a user journey.
  }
}

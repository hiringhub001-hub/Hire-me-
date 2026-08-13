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
    gtag?: (command: string, event: string, params?: Params) => void
    dataLayer?: unknown[]
  }
}

const CONSENT_KEY = 'cookie-consent'

function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted'
  } catch {
    return false
  }
}

/** Fire-and-forget. Never throws, never blocks the interaction it describes. */
export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return
  if (!window.gtag || !hasAnalyticsConsent()) return

  try {
    window.gtag('event', event, params)
  } catch {
    // Analytics must never break a user journey.
  }
}

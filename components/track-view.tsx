'use client'

import { useEffect } from 'react'

import { track, type AnalyticsEvent } from '@/lib/analytics'

/**
 * Reports a view event once per mount. Rendered from server components so a
 * page can declare what it is without becoming a client component itself.
 */
export function TrackView({
  event,
  params,
}: {
  event: AnalyticsEvent
  params?: Record<string, string | number | boolean | undefined>
}) {
  useEffect(() => {
    track(event, params)
    // Params is a fresh object each render; the event name is the identity that
    // matters, and views should fire once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  return null
}

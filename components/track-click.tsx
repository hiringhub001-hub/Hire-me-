'use client'

import { track, type AnalyticsEvent } from '@/lib/analytics'

/**
 * Wraps children in a click reporter. Used for outbound apply buttons and other
 * links where the navigation itself is what we want to measure.
 */
export function TrackClick({
  event,
  params,
  children,
}: {
  event: AnalyticsEvent
  params?: Record<string, string | number | boolean | undefined>
  children: React.ReactNode
}) {
  return (
    <span onClick={() => track(event, params)} className="contents">
      {children}
    </span>
  )
}

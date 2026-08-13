import 'server-only'

import { headers } from 'next/headers'

/**
 * In-memory fixed-window limiter. Good enough for a single Node instance and
 * for local development. On Vercel with multiple lambdas, swap the `hit`
 * implementation for Upstash Redis (`@upstash/ratelimit`) — the call sites do
 * not need to change because they only use `checkRateLimit`.
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}

// Opportunistic cleanup so the map cannot grow without bound.
function sweep(): void {
  if (buckets.size < 5000) return
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}

export async function clientIp(): Promise<string> {
  const list = await headers()
  const forwarded = list.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return list.get('x-real-ip') ?? 'unknown'
}

/**
 * @returns true when the caller is within budget, false when rate limited.
 */
export async function checkRateLimit(
  action: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): Promise<boolean> {
  sweep()
  const ip = await clientIp()
  return hit(`${action}:${ip}`, limit, windowMs)
}

/* -------------------------------------------------------------------------- */
/* Failed sign-in tracking                                                     */
/* -------------------------------------------------------------------------- */

const FAILURE_WINDOW_MS = 15 * 60_000
const ALERT_AT_ATTEMPTS = 5

const failures = new Map<string, { count: number; resetAt: number }>()

/**
 * Records a failed sign-in for an address and reports whether the operator
 * should be alerted.
 *
 * Alerts fire once per window, on the attempt that crosses the threshold, so a
 * sustained attack produces one email every 15 minutes rather than hundreds.
 * Like the limiter above this is per-instance; move it to Redis alongside
 * `hit` when running more than one.
 */
export function recordFailure(email: string): {
  attempts: number
  shouldAlert: boolean
  windowMinutes: number
} {
  const key = email.toLowerCase()
  const now = Date.now()
  const entry = failures.get(key)

  if (!entry || entry.resetAt < now) {
    failures.set(key, { count: 1, resetAt: now + FAILURE_WINDOW_MS })
    return { attempts: 1, shouldAlert: false, windowMinutes: FAILURE_WINDOW_MS / 60_000 }
  }

  entry.count += 1
  return {
    attempts: entry.count,
    // Only on the crossing attempt, not on every failure beyond it.
    shouldAlert: entry.count === ALERT_AT_ATTEMPTS,
    windowMinutes: FAILURE_WINDOW_MS / 60_000,
  }
}

/** Clears the failure counter after a successful sign-in. */
export function clearFailures(email: string): void {
  failures.delete(email.toLowerCase())
}

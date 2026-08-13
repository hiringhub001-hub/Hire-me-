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

import 'server-only'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'

import { prisma } from '@/lib/db'

/**
 * The visit log.
 *
 * Records that a page was viewed, including by people who never sign up, so the
 * admin can see whether anyone is actually arriving and what they read.
 *
 * What is deliberately not recorded: the IP address, the full user-agent, and
 * anything that would let one day's visitor be matched to another's. The
 * `visitorKey` is a hash of the address, the user agent and the server secret,
 * re-salted with the calendar date. That counts distinct visitors within a day,
 * which is the question an operator actually asks, and it becomes meaningless
 * at midnight. There is nothing here to leak or to hand over.
 */

/** Paths that are not content, or are nobody's business to log. */
const IGNORED = [
  '/admin',
  '/api',
  '/dashboard',
  '/employer',
  '/signin',
  '/signup',
  '/robots.txt',
  '/sitemap.xml',
  '/ads.txt',
  '/rss.xml',
  '/feeds',
]

function classifyDevice(ua: string): string {
  if (!ua) return 'Unknown'
  if (/bot|crawler|spider|crawling|slurp|bingpreview|headlesschrome/i.test(ua)) return 'Bot'
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'Tablet'
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'Mobile'
  return 'Desktop'
}

function classifyBrowser(ua: string): string {
  if (!ua) return 'Unknown'
  // Order matters: Edge and Opera both claim to be Chrome, Chrome claims Safari.
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet'
  if (/firefox\/|fxios/i.test(ua)) return 'Firefox'
  if (/chrome\/|crios/i.test(ua)) return 'Chrome'
  if (/safari\//i.test(ua)) return 'Safari'
  if (/bot|crawler|spider/i.test(ua)) return 'Crawler'
  return 'Other'
}

/** External host only. Internal navigation is not a referrer worth keeping. */
function externalReferrer(referer: string | null, host: string | null): string | null {
  if (!referer) return null
  try {
    const url = new URL(referer)
    if (host && url.host === host) return null
    return url.host
  } catch {
    return null
  }
}

export function visitorKey(ip: string, userAgent: string, secret: string, day: string): string {
  return createHash('sha256').update(`${day}:${secret}:${ip}:${userAgent}`).digest('hex').slice(0, 32)
}

export type PendingVisit = {
  path: string
  referrer: string | null
  device: string
  browser: string
  country: string | null
  visitorKey: string
}

/**
 * Reads the request and decides whether this view is worth recording.
 *
 * Must be called during the render, not from inside `after()` — Next refuses
 * `headers()` there, because by then the request is finished. So the reading
 * happens here and only the database write is deferred.
 *
 * @returns the row to write, or null for requests we do not log: crawlers, and
 * anything under an authenticated or non-content path.
 */
export async function collectVisit(): Promise<PendingVisit | null> {
  try {
    const list = await headers()
    const path = list.get('x-pathname')
    if (!path || IGNORED.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      return null
    }

    const userAgent = list.get('user-agent') ?? ''
    const device = classifyDevice(userAgent)
    // Crawlers are most of the traffic on a new site and none of the audience.
    if (device === 'Bot') return null

    const ip =
      list.get('x-forwarded-for')?.split(',')[0]?.trim() ?? list.get('x-real-ip') ?? 'unknown'
    const day = new Date().toISOString().slice(0, 10)

    return {
      path: path.slice(0, 512),
      referrer: externalReferrer(list.get('referer'), list.get('host')),
      device,
      browser: classifyBrowser(userAgent),
      country: list.get('x-vercel-ip-country') ?? null,
      visitorKey: visitorKey(ip, userAgent, process.env.AUTH_SECRET ?? 'careerhub', day),
    }
  } catch {
    return null
  }
}

const RETENTION_DAYS = 90

/**
 * Enforces the 90 days the privacy policy promises.
 *
 * Run from the recording path rather than a scheduled job, roughly once every
 * hundred views, so the guarantee holds on its own without depending on a cron
 * that someone has to remember to configure. A promise in a privacy policy that
 * nothing implements is worse than no promise.
 */
async function pruneOldVisits(): Promise<void> {
  if (Math.random() > 0.01) return
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)
  await prisma.visit.deleteMany({ where: { createdAt: { lt: cutoff } } })
}

/**
 * Writes one row, after the response has gone out. Never throws: failing to
 * record a page view must never cost a visitor the page they asked for.
 */
export async function recordVisit(
  visit: PendingVisit | null,
  userId: string | null,
): Promise<void> {
  if (!visit) return
  try {
    await prisma.visit.create({ data: { ...visit, userId } })
    await pruneOldVisits()
  } catch {
    // Best effort by design: a page view that goes unrecorded costs nothing,
    // a page that fails to render costs a visitor.
  }
}

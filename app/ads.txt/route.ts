import { site } from '@/lib/site'

/**
 * ads.txt — the IAB authorised-sellers file.
 *
 * AdSense expects this at the domain root once ads are running; without it,
 * some buyers treat the inventory as unauthorised and bids drop. It is
 * generated from the publisher ID so there is nothing to keep in sync by hand,
 * and it stays empty until that ID is configured.
 */
export function GET(): Response {
  const publisherId = site.adsenseClient.replace(/^ca-/, '')

  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# No advertising configured yet. Set NEXT_PUBLIC_ADSENSE_CLIENT to publish this file.\n'

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

/**
 * Ad placement policy for this site
 * ---------------------------------
 * 1. Slots only render when `site.adsEnabled` is true. Until AdSense approves
 *    the account nothing is rendered at all — reviewers must never see empty ad
 *    boxes or placeholder blocks. The verification script loads regardless.
 * 2. Slots are only allowed in the positions enumerated by `AdPlacement`.
 *    There is deliberately no placement next to an Apply button, inside a
 *    form, or above the fold on a job page.
 * 3. At most one slot per screenful; every page keeps a content-to-ad ratio
 *    that leaves the page useful with ads disabled.
 * 4. Slots reserve their height to avoid layout shift (Core Web Vitals / CLS).
 */
export type AdPlacement =
  | 'article-inline' // between sections of a long guide
  | 'article-end' // after the article body, before related links
  | 'sidebar' // desktop sidebar on listing and article pages
  | 'listing-footer' // below a full page of job results

const placementStyles: Record<AdPlacement, string> = {
  'article-inline': 'my-10 min-h-[250px]',
  'article-end': 'mt-12 min-h-[280px]',
  sidebar: 'sticky top-24 hidden min-h-[600px] lg:block',
  'listing-footer': 'mt-10 min-h-[250px]',
}

export function AdSlot({
  placement,
  slotId,
  className,
}: {
  placement: AdPlacement
  slotId?: string
  className?: string
}) {
  // Gated on adsEnabled, not on the publisher ID: the verification script is
  // installed and loading, but no ad placements render until AdSense approves
  // the site. An empty slot shown to a reviewer reads as an unfinished page.
  if (!site.adsEnabled || !site.adsenseClient) return null

  return (
    <aside
      aria-label="Advertisement"
      className={cn('flex flex-col items-center', placementStyles[placement], className)}
    >
      <span className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Advertisement</span>
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block' }}
        data-ad-client={site.adsenseClient}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: '(adsbygoogle = window.adsbygoogle || []).push({});',
        }}
      />
    </aside>
  )
}

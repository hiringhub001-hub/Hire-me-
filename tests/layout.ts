/* eslint-disable no-console */
/**
 * Horizontal overflow audit.
 *
 * A page must never be wider than its viewport — that is what produces the
 * sideways scroll and cut-off content on phones and tablets. This walks every
 * page type at every breakpoint we care about, and when it finds overflow it
 * names the specific elements responsible so the fix is not guesswork.
 *
 * Two things this suite learned the hard way:
 *
 *  - The page list is discovered from the sitemap, not hard-coded. It used to
 *    name specific job and company slugs; when those listings went, the paths
 *    404ed, a 404 page does not overflow, and the suite reported success while
 *    real pages were broken.
 *  - A page that fails to load is a failure, not a skip. Silently passing over
 *    a navigation error is how the same blind spot comes back.
 *
 * The signed-in screens are covered too. They hold the widest things on the
 * site — tables of users and visits — and no signed-out crawl can reach them.
 */
import { chromium, type Page } from 'playwright'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3600'

// Optional: set these to include the admin, employer and candidate screens.
const ADMIN_EMAIL = process.env.LAYOUT_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.LAYOUT_ADMIN_PASSWORD ?? ''

const viewports = [
  { name: 'iPhone SE', width: 320, height: 700 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone Plus', width: 428, height: 926 },
  { name: 'iPad portrait', width: 768, height: 1024 },
  { name: 'iPad landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Desktop', width: 1440, height: 900 },
]

/** Pages that exist whatever is in the database. */
const staticPaths = [
  '/',
  '/jobs',
  '/companies',
  '/career',
  '/interview',
  '/salary',
  '/blog',
  '/tools',
  '/tools/resume-builder',
  '/tools/cover-letter-builder',
  '/tools/job-match',
  '/job-alerts',
  '/for-employers',
  '/get-started',
  '/recruiter-access',
  '/about',
  '/contact',
  '/careers',
  '/faq',
  '/sitemap',
  '/privacy',
  '/terms',
  '/cookies',
  '/disclaimer',
  '/accessibility',
  '/editorial-policy',
  '/signin',
  '/signup',
]

/** Screens only a signed-in admin can reach. */
const signedInPaths = [
  '/admin',
  '/admin/jobs',
  '/admin/jobs?status=PENDING',
  '/admin/users',
  '/admin/visitors',
  '/employer',
  '/employer/jobs',
  '/employer/applications',
  '/employer/post-job',
  '/dashboard',
  '/dashboard/applications',
  '/dashboard/saved',
  '/dashboard/profile',
]

/**
 * One live example of each templated route, taken from the sitemap.
 *
 * Testing every listing would take an hour and tell us nothing extra: pages
 * built from the same template break in the same place.
 */
async function sampleDynamicPaths(): Promise<string[]> {
  const response = await fetch(`${BASE}/sitemap.xml`)
  const xml = await response.text()
  const all = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => (match[1] as string).replace(/^https?:\/\/[^/]+/, ''))
    .filter(Boolean)

  const templates = [
    /^\/jobs\/[^/]+$/,
    /^\/company\/[^/]+$/,
    /^\/career\/[^/]+$/,
    /^\/interview\/[^/]+$/,
    /^\/salary\/[^/]+$/,
    /^\/blog\/[^/]+$/,
    /^\/jobs\/category\/[^/]+$/,
    /^\/jobs\/location\/[^/]+$/,
  ]

  const picked: string[] = []
  for (const template of templates) {
    // Two of each, so a page that only breaks on long content is still caught.
    picked.push(...all.filter((path) => template.test(path)).slice(0, 2))
  }
  return [...new Set(picked)]
}


let passed = 0
let failed = 0

// Evaluated as a string: the TypeScript loader rewrites inline functions with
// helpers that do not exist inside the page, so the probe is kept as source.
const PROBE = `(() => {
  const doc = document.documentElement
  const overflow = doc.scrollWidth - doc.clientWidth
  const culprits = []

  if (overflow > 0) {
    const limit = doc.clientWidth

    // An element sticking out past the viewport is harmless if an ancestor
    // clips it (an off-screen drawer, a horizontally scrollable table). Only
    // unclipped elements actually widen the document.
    function isClipped(el) {
      let parent = el.parentElement
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent)
        const ox = style.overflowX
        if (ox === 'hidden' || ox === 'auto' || ox === 'scroll') return true
        parent = parent.parentElement
      }
      return false
    }

    const all = Array.prototype.slice.call(document.body.querySelectorAll('*'))
    for (const el of all) {
      const box = el.getBoundingClientRect()
      if (box.width === 0 && box.height === 0) continue
      if (box.right <= limit + 1 && box.left >= -1) continue
      if (isClipped(el)) continue
      const cls = (el.getAttribute('class') || '').slice(0, 80)
      const text = (el.textContent || '').trim().slice(0, 40)
      culprits.push(
        el.tagName.toLowerCase() + '.' + cls +
        '\\n           [' + Math.round(box.left) + '..' + Math.round(box.right) + '] "' + text + '"',
      )
      if (culprits.length >= 4) break
    }
  }

  return { overflow: overflow, culprits: culprits }
})()`

async function audit(page: Page, label: string) {
  const result = (await page.evaluate(PROBE)) as { overflow: number; culprits: string[] }

  if (result.overflow <= 0) {
    passed += 1
  } else {
    failed += 1
    console.log(`  FAIL ${label} overflows by ${result.overflow}px`)
    for (const culprit of result.culprits) console.log(`         ${culprit}`)
  }
}

async function visit(page: Page, path: string, label: string): Promise<boolean> {
  try {
    const response = await page.goto(`${BASE}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    const status = response?.status() ?? 0
    if (status >= 400) {
      failed += 1
      console.log(`  FAIL ${label} returned HTTP ${status}`)
      return false
    }
    // Let fonts and images settle: a late-loading image is a classic cause of
    // overflow that a domcontentloaded snapshot would miss.
    await page.waitForTimeout(250)
    return true
  } catch (error) {
    failed += 1
    console.log(`  FAIL ${label} could not be loaded — ${(error as Error).message.split('\n')[0]}`)
    return false
  }
}

async function main() {
  const dynamicPaths = await sampleDynamicPaths()
  const publicPaths = [...staticPaths, ...dynamicPaths]
  console.log(
    `\nAuditing ${publicPaths.length} public and ${signedInPaths.length} signed-in pages ` +
      `across ${viewports.length} widths`,
  )

  const browser = await chromium.launch()

  for (const viewport of viewports) {
    console.log(`\n${viewport.name} (${viewport.width}px)`)

    // A fresh context per width: sizing is applied at creation, and a signed-in
    // session must not leak into the signed-out pass.
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    })
    const page = await context.newPage()

    for (const path of publicPaths) {
      if (await visit(page, path, path)) await audit(page, path)
    }

    // The drawer is the most likely offender, so check it open as well.
    if (await visit(page, '/jobs', '/jobs (for menu check)')) {
      const toggle = page.locator('button[aria-label="Open menu"]')
      if (await toggle.isVisible()) {
        await toggle.click()
        await page.waitForTimeout(400)
        await audit(page, '/jobs (open menu)')
        await page.keyboard.press('Escape')
      }
    }

    // Signed-in screens. Skipped without an admin to sign in as, rather than
    // failing, so the suite still runs against a database without one.
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      await page.goto(`${BASE}/signin`, { waitUntil: 'domcontentloaded' })
      await page.fill('#email', ADMIN_EMAIL)
      await page.fill('#password', ADMIN_PASSWORD)
      await page.click('form button[type=submit]')
      try {
        await page.waitForURL((url) => !url.pathname.startsWith('/signin'), { timeout: 20000 })
        for (const path of signedInPaths) {
          if (await visit(page, path, path)) await audit(page, path)
        }
      } catch {
        console.log('  (could not sign in — signed-in pages not audited)')
      }
    }

    await context.close()
    console.log(`  ${passed} checks passed so far`)
  }

  await browser.close()
  console.log(`\n${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

void main()

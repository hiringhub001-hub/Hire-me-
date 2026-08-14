/* eslint-disable no-console */
/**
 * Horizontal overflow audit.
 *
 * A page must never be wider than its viewport — that is what produces the
 * sideways scroll and cut-off content on phones and tablets. This walks the
 * main pages at every breakpoint we care about, and when it finds overflow it
 * names the specific elements responsible so the fix is not guesswork.
 */
import { chromium, type Page } from 'playwright'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3600'

const viewports = [
  { name: 'iPhone SE', width: 320, height: 700 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone Plus', width: 428, height: 926 },
  { name: 'iPad portrait', width: 768, height: 1024 },
  { name: 'iPad landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Desktop', width: 1440, height: 900 },
]

const paths = [
  '/',
  '/jobs',
  '/jobs/frontend-developer-manchester',
  '/companies',
  '/company/northwind-labs',
  '/career/how-to-write-a-resume',
  '/salary/frontend-developer',
  '/tools/resume-builder',
  '/tools/job-match',
  '/get-started',
  '/jobs/category/technology',
  '/jobs/location/united-kingdom',
  '/signup',
  '/faq',
  '/privacy',
]

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

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    console.log(`\n${viewport.name} (${viewport.width}px)`)

    for (const path of paths) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
      await audit(page, `${path} (closed menu)`)
    }

    // The drawer is the most likely offender, so check it open as well.
    await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' })
    const toggle = page.locator('button[aria-label="Open menu"]')
    if (await toggle.isVisible()) {
      await toggle.click()
      await page.waitForTimeout(400)
      await audit(page, '/jobs (open menu)')
      await page.keyboard.press('Escape')
    }
    console.log(`  ${passed} checks passed so far`)
  }

  await browser.close()
  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

void main()

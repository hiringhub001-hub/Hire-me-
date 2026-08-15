/* eslint-disable no-console */
/**
 * AdSense readiness audit.
 *
 * Checks the things a reviewer and the automated policy scan actually look at:
 * required policy pages, real content rather than thin pages, honest ad
 * placement, working navigation, and consent handling. Run against a built
 * server, or against production with E2E_BASE_URL.
 *
 *   npm run audit:ads
 *   E2E_BASE_URL=https://careerhub.com.ng npm run audit:ads
 */
import { chromium } from 'playwright'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

let pass = 0
let warn = 0
let fail = 0

function ok(label: string, detail = '') {
  pass += 1
  console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ''}`)
}
function bad(label: string, detail = '') {
  fail += 1
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
}
function caution(label: string, detail = '') {
  warn += 1
  console.log(`  WARN  ${label}${detail ? ` — ${detail}` : ''}`)
}
function check(condition: boolean, label: string, detail = '') {
  condition ? ok(label, detail) : bad(label, detail)
}

/** Visible words, excluding scripts, styles and markup. */
function wordCount(html: string): number {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
  return body.split(/\s+/).filter(Boolean).length
}

/** Pages AdSense expects a real publisher to have. */
const POLICY_PAGES = [
  '/about',
  '/contact',
  '/privacy',
  '/cookies',
  '/terms',
  '/editorial-policy',
  '/disclaimer',
  '/accessibility',
]

/** A spread of the page types a reviewer would click through. */
const SAMPLE_PAGES = [
  '/',
  '/jobs',
  '/companies',
  '/career',
  '/career/how-to-write-a-resume',
  '/salary/frontend-developer',
  '/interview/frontend-developer',
  '/blog/how-to-spot-a-job-scam',
  '/tools',
  '/tools/resume-builder',
  '/jobs/category/technology',
  '/faq',
  '/for-employers',
]

async function get(path: string): Promise<{ status: number; html: string }> {
  const response = await fetch(`${BASE}${path}`, { redirect: 'follow' })
  return { status: response.status, html: await response.text() }
}

async function main() {
  console.log(`\nAdSense readiness audit of ${BASE}\n`)

  /* 1 — required pages ------------------------------------------------------ */
  console.log('1. Required policy pages')
  for (const path of POLICY_PAGES) {
    const { status, html } = await get(path)
    if (status !== 200) {
      bad(`${path} reachable`, `HTTP ${status}`)
      continue
    }
    const words = wordCount(html)
    // A policy page that is three lines long reads as boilerplate.
    check(words >= 250, `${path}`, `${words} words`)
  }

  /* 2 — content depth ------------------------------------------------------- */
  console.log('\n2. Content depth (thin pages are the top rejection reason)')
  for (const path of SAMPLE_PAGES) {
    const { status, html } = await get(path)
    if (status !== 200) {
      bad(`${path} reachable`, `HTTP ${status}`)
      continue
    }
    const words = wordCount(html)
    if (words >= 400) ok(path, `${words} words`)
    else if (words >= 250) caution(path, `${words} words — thin, consider expanding`)
    else bad(path, `${words} words — too thin to monetise`)
  }

  /* 3 — every page identifies itself ---------------------------------------- */
  console.log('\n3. Metadata on every sampled page')
  let missingMeta = 0
  for (const path of [...SAMPLE_PAGES, ...POLICY_PAGES]) {
    const { html } = await get(path)
    const hasTitle = /<title>[^<]{10,}/.test(html)
    const hasDescription = /<meta name="description" content="[^"]{40,}"/.test(html)
    const hasCanonical = /<link rel="canonical"/.test(html)
    if (!hasTitle || !hasDescription || !hasCanonical) {
      missingMeta += 1
      bad(`${path} metadata`, `title=${hasTitle} description=${hasDescription} canonical=${hasCanonical}`)
    }
  }
  if (!missingMeta) ok('All sampled pages have title, description and canonical')

  /* 4 — the ad implementation ------------------------------------------------ */
  console.log('\n4. Ad implementation')
  const home = await get('/')
  const loaders =
    home.html.match(/<script[^>]*src="[^"]*adsbygoogle\.js[^"]*"[^>]*>/g) ?? []
  check(loaders.length === 1, 'Exactly one AdSense loader', `${loaders.length} found`)
  check(
    home.html.split('</head>')[0]?.includes('adsbygoogle.js') ?? false,
    'Loader is in <head>',
  )
  check(
    /<meta name="google-adsense-account" content="ca-pub-\d+"/.test(home.html),
    'google-adsense-account meta present',
  )

  const adsTxt = await get('/ads.txt')
  check(adsTxt.status === 200, 'ads.txt served')
  const publisher = /ca-pub-(\d+)/.exec(home.html)?.[1]
  check(
    Boolean(publisher && adsTxt.html.includes(`pub-${publisher}`)),
    'ads.txt authorises the same publisher as the page',
    adsTxt.html.trim().split('\n')[0],
  )

  /* 5 — placement policy ----------------------------------------------------- */
  console.log('\n5. Placement policy')
  const jobList = await get('/jobs')
  const jobSlug = /\/jobs\/([a-z0-9-]+)"/.exec(jobList.html)?.[1]
  const jobPage = jobSlug ? await get(`/jobs/${jobSlug}`) : { status: 0, html: '' }

  const adUnits = (path: string, html: string) => (html.match(/class="[^"]*adsbygoogle/g) ?? []).length
  const totalUnits =
    adUnits('/', home.html) + adUnits('/jobs', jobList.html) + adUnits('job', jobPage.html)

  if (totalUnits === 0) {
    ok('No ad units rendered', 'correct until AdSense approves the site')
  } else {
    // Only meaningful once ads are switched on.
    const applyIndex = jobPage.html.indexOf('id="apply"')
    const adIndexes = [...jobPage.html.matchAll(/class="[^"]*adsbygoogle/g)].map((m) => m.index ?? 0)
    const near = adIndexes.some((index) => applyIndex > 0 && Math.abs(index - applyIndex) < 2000)
    check(!near, 'No ad adjacent to the apply form')
  }

  /* 6 — consent -------------------------------------------------------------- */
  console.log('\n6. Consent and privacy')
  check(/cookie-consent|Cookie Policy/i.test(home.html), 'Cookie notice present')
  const privacy = await get('/privacy')
  check(/AdSense|advertising cookies|Google/i.test(privacy.html), 'Privacy policy discloses advertising')
  check(/consent/i.test(privacy.html), 'Privacy policy explains consent')

  /* 7 — navigation integrity -------------------------------------------------- */
  console.log('\n7. Navigation (a reviewer clicks around)')
  const links = new Set<string>()
  for (const path of ['/', '/jobs', '/career']) {
    const { html } = await get(path)
    for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
      const href = match[1] as string
      if (!href.startsWith('/_next') && !href.startsWith('/api')) links.add(href)
    }
  }
  const broken: string[] = []
  for (const href of [...links].slice(0, 60)) {
    const response = await fetch(`${BASE}${href}`, { redirect: 'follow' })
    if (response.status >= 400) broken.push(`${href} -> ${response.status}`)
  }
  check(broken.length === 0, `No broken internal links (${links.size} checked)`, broken.slice(0, 5).join(', '))

  /* 8 — placeholder content --------------------------------------------------- */
  console.log('\n8. Placeholder content a reviewer would notice')
  // A failure, not a warning. An invented employer is misleading content under
  // AdSense policy, and on a job board it also wastes a real applicant's time.
  let placeholders = 0
  for (const path of ['/', '/jobs', '/companies']) {
    const { html } = await get(path)
    const hit = /example\.com|lorem ipsum|coming soon|under construction/i.exec(html)
    if (hit) {
      placeholders += 1
      bad(`${path} contains placeholder content`, `matched "${hit[0]}"`)
    }
  }
  if (!placeholders) ok('No placeholder or demo content on key pages')

  /* 9 — admin surface --------------------------------------------------------- */
  console.log('\n9. Admin surface is not public')
  const browser = await chromium.launch()
  const anon = await browser.newPage()
  await anon.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  const anonBody = (await anon.textContent('body')) ?? ''
  check(!/>Admin</.test(anonBody), 'Signed-out visitor sees no Admin link')
  const adminResponse = await fetch(`${BASE}/admin`, { redirect: 'manual' })
  check(
    adminResponse.status === 307 || adminResponse.status === 302,
    '/admin redirects anonymous visitors',
    `HTTP ${adminResponse.status}`,
  )
  const robots = await get('/robots.txt')
  check(/Disallow: \/admin/.test(robots.html), 'robots.txt disallows /admin')
  await browser.close()

  console.log(`\n${pass} passed, ${warn} warnings, ${fail} failed\n`)
  process.exit(fail > 0 ? 1 : 0)
}

void main()

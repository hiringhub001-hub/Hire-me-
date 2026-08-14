/* eslint-disable no-console */
/**
 * SEO audit: sitemap.xml, robots.txt and canonicals.
 *
 * The check that matters most here is the cross-check between the two files.
 * A sitemap that lists URLs robots.txt forbids is the single most common way a
 * site tells Google two contradictory things, and Search Console reports it as
 * "Submitted URL blocked by robots.txt" rather than anything obvious.
 *
 *   npx next start -p 3200  &&  npm run test:seo
 */
import { XMLParser } from 'fast-xml-parser'
import { PrismaClient } from '@prisma/client'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3200'
const prisma = new PrismaClient()

let passed = 0
let failed = 0

function check(label: string, ok: boolean, detail = '') {
  if (ok) {
    passed += 1
    console.log(`  PASS  ${label}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

/** Paths that must never appear in a public sitemap. */
const PRIVATE_PREFIXES = [
  '/dashboard',
  '/employer',
  '/admin',
  '/api/',
  '/signin',
  '/signup',
  '/recruiter-access',
]

/**
 * Minimal robots.txt matcher following Google's rules: `*` and `$` are the only
 * wildcards, everything else is a literal prefix match against path+query.
 */
function parseRobots(text: string) {
  const disallow: string[] = []
  const allow: string[] = []
  let inStar = false
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (/^user-agent:/i.test(trimmed)) inStar = trimmed.split(':')[1]?.trim() === '*'
    if (!inStar) continue
    const dis = /^disallow:\s*(\S*)/i.exec(trimmed)
    if (dis) disallow.push(dis[1] ?? '')
    const alw = /^allow:\s*(\S*)/i.exec(trimmed)
    if (alw) allow.push(alw[1] ?? '')
  }
  return { allow: allow.filter(Boolean), disallow: disallow.filter(Boolean) }
}

function matches(rule: string, pathAndQuery: string): boolean {
  // In robots.txt only `*` and a trailing `$` are special. Every other
  // character — `?` above all — is literal, which is precisely why
  // `Disallow: /jobs?` blocks `/jobs?q=x` and leaves `/jobs` alone. Escape
  // everything, then reinstate `*` as the sole wildcard.
  const endAnchored = rule.endsWith('$')
  const body = endAnchored ? rule.slice(0, -1) : rule
  const escaped = body.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')
  return new RegExp(`^${escaped}${endAnchored ? '$' : ''}`).test(pathAndQuery)
}

/** Google applies the most specific (longest) matching rule. */
function isBlocked(rules: { allow: string[]; disallow: string[] }, pathAndQuery: string): boolean {
  const longest = (list: string[]) =>
    list.filter((rule) => matches(rule, pathAndQuery)).sort((a, b) => b.length - a.length)[0] ?? ''
  const bestAllow = longest(rules.allow)
  const bestDisallow = longest(rules.disallow)
  if (!bestDisallow) return false
  return bestDisallow.length > bestAllow.length
}

async function main() {
  console.log(`\nSEO audit of ${BASE}\n`)

  /* 1 — sitemap fetches and parses ----------------------------------------- */
  console.log('1. sitemap.xml')
  const sitemapResponse = await fetch(`${BASE}/sitemap.xml`)
  check('Returns HTTP 200', sitemapResponse.status === 200, `got ${sitemapResponse.status}`)
  check(
    'Served as XML',
    (sitemapResponse.headers.get('content-type') ?? '').includes('xml'),
    sitemapResponse.headers.get('content-type') ?? 'none',
  )

  const xml = await sitemapResponse.text()
  let urls: string[] = []
  try {
    const parsed = new XMLParser().parse(xml) as {
      urlset?: { url?: { loc: string } | { loc: string }[] }
    }
    const entries = parsed.urlset?.url
    urls = (Array.isArray(entries) ? entries : entries ? [entries] : []).map((e) => e.loc)
    check('Valid XML with a urlset', urls.length > 0, `${urls.length} URLs`)
  } catch (error) {
    check('Valid XML with a urlset', false, String(error))
  }

  const origin = new URL(urls[0] ?? BASE).origin
  check(
    'Every URL uses one consistent origin',
    urls.every((url) => url.startsWith(origin)),
    origin,
  )
  check('No duplicate URLs', new Set(urls).size === urls.length, `${urls.length - new Set(urls).size} duplicate(s)`)
  check(
    'No query-string URLs',
    urls.every((url) => !url.includes('?')),
    urls.filter((u) => u.includes('?')).slice(0, 3).join(', '),
  )

  /* 2 — robots.txt ---------------------------------------------------------- */
  console.log('\n2. robots.txt')
  const robotsResponse = await fetch(`${BASE}/robots.txt`)
  const robotsText = await robotsResponse.text()
  check('Returns HTTP 200', robotsResponse.status === 200)
  const rules = parseRobots(robotsText)

  const sitemapLine = /^sitemap:\s*(\S+)/im.exec(robotsText)?.[1]
  check('Declares a sitemap', Boolean(sitemapLine), sitemapLine ?? 'missing')
  check(
    'Declared sitemap matches the sitemap origin',
    Boolean(sitemapLine && new URL(sitemapLine).origin === origin),
    `${sitemapLine} vs ${origin}`,
  )

  for (const prefix of PRIVATE_PREFIXES) {
    check(`Blocks ${prefix}`, isBlocked(rules, prefix === '/api/' ? '/api/x' : prefix))
  }

  // The rules that must NOT block anything.
  check('Allows /jobs', !isBlocked(rules, '/jobs'))
  check('Allows individual job pages', !isBlocked(rules, '/jobs/frontend-developer-manchester'))
  check('Allows category landing pages', !isBlocked(rules, '/jobs/category/technology'))
  check('Allows location landing pages', !isBlocked(rules, '/jobs/location/nigeria'))
  check('Blocks filtered search URLs', isBlocked(rules, '/jobs?q=react'))

  /* 3 — the cross-check ----------------------------------------------------- */
  console.log('\n3. sitemap vs robots.txt')
  const blocked = urls.filter((url) => isBlocked(rules, new URL(url).pathname + new URL(url).search))
  check('No sitemap URL is blocked by robots.txt', blocked.length === 0, blocked.slice(0, 5).join(', '))

  const priv = urls.filter((url) =>
    PRIVATE_PREFIXES.some((prefix) => new URL(url).pathname.startsWith(prefix)),
  )
  check('No private area in the sitemap', priv.length === 0, priv.slice(0, 5).join(', '))

  /* 4 — coverage ------------------------------------------------------------ */
  console.log('\n4. Coverage')
  const liveJobs = await prisma.job.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { slug: true },
  })
  const missingJobs = liveJobs.filter((job) => !urls.some((url) => url.endsWith(`/jobs/${job.slug}`)))
  check(
    'Every live job page is in the sitemap',
    missingJobs.length === 0,
    missingJobs.slice(0, 5).map((j) => j.slug).join(', '),
  )

  const posts = await prisma.post.findMany({ where: { published: true }, select: { slug: true } })
  const missingPosts = posts.filter((post) => !urls.some((url) => url.endsWith(`/${post.slug}`)))
  check(
    'Every published article is in the sitemap',
    missingPosts.length === 0,
    missingPosts.slice(0, 5).map((p) => p.slug).join(', '),
  )

  const expired = await prisma.job.findMany({
    where: { status: 'PUBLISHED', expiresAt: { lt: new Date() } },
    select: { slug: true },
  })
  const leaked = expired.filter((job) => urls.some((url) => url.endsWith(`/jobs/${job.slug}`)))
  check('No expired job is in the sitemap', leaked.length === 0, leaked.map((j) => j.slug).join(', '))

  /* 5 — canonicals ---------------------------------------------------------- */
  console.log('\n5. Canonical URLs')
  for (const path of ['/', '/jobs', '/career/how-to-write-a-resume']) {
    const html = await fetch(`${BASE}${path}`).then((r) => r.text())
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1]
    check(
      `${path} has a canonical on the sitemap origin`,
      Boolean(canonical && new URL(canonical).origin === origin),
      canonical ?? 'missing',
    )
  }

  console.log(`\n${passed} passed, ${failed} failed\n`)
  if (urls.length) {
    console.log('Sitemap URLs:')
    for (const url of urls) console.log('  ' + url)
  }

  await prisma.$disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

void main()

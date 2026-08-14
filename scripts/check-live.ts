/* eslint-disable no-console */
/**
 * Production readiness check for the live domain.
 *
 * Answers, in one command, the question "is the site actually reachable and
 * correctly tagged?" — the thing Google is really testing when it says it
 * cannot find your site or your tag.
 *
 *   npm run check:live
 *   npm run check:live -- www.careerhub.com.ng
 *
 * DNS is queried through Google's public DNS-over-HTTPS resolver, which is the
 * same view of your records that Google's own crawlers get. That matters: a
 * record can look right in the Cloudflare dashboard and still not be published.
 */
import { connect } from 'node:tls'

const HOST = process.argv[2] ?? 'careerhub.com.ng'
const APEX = HOST.replace(/^www\./, '')
const WWW = `www.${APEX}`

/** Vercel's documented apex target and CNAME target. */
const VERCEL_A = '76.76.21.21'
const VERCEL_CNAME = 'vercel-dns.com'

let failures = 0

function report(ok: boolean, label: string, detail = '') {
  if (!ok) failures += 1
  console.log(`  ${ok ? 'OK  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
}

type DnsAnswer = { data?: string }

async function resolve(name: string, type: string): Promise<{ status: number; data: string[] }> {
  const response = await fetch(`https://dns.google/resolve?name=${name}&type=${type}`)
  const json = (await response.json()) as { Status?: number; Answer?: DnsAnswer[] }
  return {
    status: json.Status ?? -1,
    data: (json.Answer ?? []).map((a) => a.data ?? '').filter(Boolean),
  }
}

/**
 * Fetches over TLS with an explicit IP, so the deployment can be inspected even
 * before DNS is published. Without this you cannot tell "DNS missing" apart
 * from "site broken", which are very different problems.
 */
function fetchViaIp(ip: string, host: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = connect(
      { host: ip, port: 443, servername: host, rejectUnauthorized: false },
      () => {
        socket.write(
          `GET ${path} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: careerhub-check\r\nConnection: close\r\n\r\n`,
        )
      },
    )
    let buffer = ''
    socket.setTimeout(20000, () => socket.destroy(new Error('timed out')))
    socket.on('data', (chunk) => (buffer += chunk.toString('utf8')))
    socket.on('end', () => resolve(buffer))
    socket.on('error', reject)
  })
}

async function main() {
  console.log(`\nChecking ${APEX}\n`)

  /* 1 — DNS ---------------------------------------------------------------- */
  console.log('1. DNS (as Google sees it)')
  const [ns, apexA, apexCname, wwwA, wwwCname] = await Promise.all([
    resolve(APEX, 'NS'),
    resolve(APEX, 'A'),
    resolve(APEX, 'CNAME'),
    resolve(WWW, 'A'),
    resolve(WWW, 'CNAME'),
  ])

  report(ns.data.length > 0, 'Domain is delegated to nameservers', ns.data.join(', ') || 'none')

  const apexPointsSomewhere = apexA.data.length > 0 || apexCname.data.length > 0
  report(
    apexPointsSomewhere,
    `${APEX} has an address record`,
    apexPointsSomewhere ? [...apexA.data, ...apexCname.data].join(', ') : `add an A record → ${VERCEL_A}`,
  )
  if (apexA.data.length && !apexA.data.includes(VERCEL_A)) {
    console.log(`        note: A record is ${apexA.data.join(', ')}, Vercel expects ${VERCEL_A}`)
  }

  const wwwExists = wwwA.data.length > 0 || wwwCname.data.length > 0
  report(
    wwwExists,
    `${WWW} resolves`,
    wwwExists
      ? [...wwwCname.data, ...wwwA.data].join(', ')
      : `add a CNAME record → cname.${VERCEL_CNAME}`,
  )

  /* 2 — the deployment itself ---------------------------------------------- */
  console.log('\n2. Deployment (checked directly at Vercel, bypassing DNS)')
  let html = ''
  try {
    // Follow the apex → www redirect that Vercel applies by default.
    const apexResponse = await fetchViaIp(VERCEL_A, APEX, '/')
    const statusLine = apexResponse.split('\r\n')[0] ?? ''
    const location = /location:\s*(\S+)/i.exec(apexResponse)?.[1]
    const redirects = /30[128]/.test(statusLine)
    console.log(`        apex responds: ${statusLine.trim()}${location ? ` → ${location}` : ''}`)

    const target = redirects && location?.includes('www.') ? WWW : APEX
    const raw = await fetchViaIp(VERCEL_A, target, '/')
    html = raw.split('\r\n\r\n').slice(1).join('\r\n\r\n')
    report(/200 OK/.test(raw.split('\r\n')[0] ?? ''), `${target} serves the site`)
  } catch (error) {
    report(false, 'Could not reach the deployment', String(error))
  }

  /* 3 — tags Google looks for ---------------------------------------------- */
  console.log('\n3. Tags Google checks')
  const head = html.split('</head>')[0] ?? ''
  const verification = /<meta name="google-site-verification" content="([^"]+)"/.exec(html)?.[1]
  const gaIds = [...html.matchAll(/googletagmanager\.com\/gtag\/js\?id=([A-Za-z0-9-]+)/g)].map(
    (m) => m[1] as string,
  )
  const loaders = html.match(/<script[^>]*src="[^"]*googletagmanager\.com\/gtag\/js[^"]*"[^>]*>/g)

  report(Boolean(verification), 'Search Console verification meta present', verification ?? 'missing')
  report(gaIds.length > 0, 'Google tag present', [...new Set(gaIds)].join(', ') || 'missing')
  report((loaders?.length ?? 0) <= 1, 'No duplicate Google tag', `${loaders?.length ?? 0} loader(s)`)
  report(head.includes('googletagmanager'), 'Tag is inside <head>')

  /* 4 — content ------------------------------------------------------------ */
  console.log('\n4. Content')
  try {
    const jobsRaw = await fetchViaIp(VERCEL_A, WWW, '/jobs')
    const jobsHtml = jobsRaw.split('\r\n\r\n').slice(1).join('\r\n\r\n')
    const cards = (jobsHtml.match(/<article[^>]*class="[^"]*group/g) ?? []).length
    report(cards > 0, 'Jobs are published on the live site', `${cards} listing(s) — an empty board cannot rank, and AdSense treats it as thin`)

    const sitemapRaw = await fetchViaIp(VERCEL_A, WWW, '/sitemap.xml')
    const locs = (sitemapRaw.match(/<loc>/g) ?? []).length
    report(locs > 0, 'Sitemap is served', `${locs} URLs`)
  } catch (error) {
    report(false, 'Could not read content pages', String(error))
  }

  console.log(
    failures === 0
      ? '\nEverything checks out — retry verification in Search Console.\n'
      : `\n${failures} item(s) need attention. Fix the FAIL lines above, then run this again.\n`,
  )
  process.exit(failures > 0 ? 1 : 0)
}

void main()

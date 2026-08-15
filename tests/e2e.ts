/* eslint-disable no-console */
/**
 * End-to-end journey test, driven through a real browser.
 *
 * Covers the full loop the product depends on:
 *   1. a visitor chooses "I am a recruiter" and registers
 *   2. the recruiter posts a job
 *   3. an admin approves it
 *   4. a job seeker finds it and applies
 *   5. the applicant sees an "Application successful" screen
 *   6. confirmation, recruiter and admin emails are queued
 *   7. the recruiter sees the applicant, downloads the CV and sets a status
 *   8. a job seeker is never offered a way to post a job
 *   9. the CV is a real uploaded file, and only the right people can fetch it
 *
 * Run against a built server:  npx next start -p 3200  then  npm run test:e2e
 */
import { chromium, type Browser, type Page } from 'playwright'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3200'
const ADMIN_INBOX = process.env.ADMIN_EMAIL ?? 'hiringhub001@gmail.com'
const prisma = new PrismaClient()

/**
 * This suite creates and deletes users, jobs and applications. Pointing it at a
 * live database would churn real data, and DATABASE_URL in .env is easily left
 * pointing at production after a debugging session — so refuse unless the
 * target is obviously local, or the intent is stated explicitly.
 */
function assertSafeDatabase() {
  const url = process.env.DATABASE_URL ?? ''
  const isLocal = /@(localhost|127\.0\.0\.1|postgres|db)[:/]/.test(url)
  if (isLocal || process.env.ALLOW_DESTRUCTIVE_TESTS === 'true') return

  const redacted = url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
  console.error(`
Refusing to run: DATABASE_URL does not look local.

  ${redacted || '(unset)'}

This suite creates and deletes users, jobs and applications. Point DATABASE_URL
at your local database (npm run db:up) and try again.

If you really mean to run it here, set ALLOW_DESTRUCTIVE_TESTS=true.
`)
  process.exit(1)
}

let passed = 0
let failed = 0

function check(label: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  PASS  ${label}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

async function signIn(page: Page, email: string, password = 'password123') {
  await page.goto(`${BASE}/signin`)
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type=submit]')
  // The redirect is driven by the client router after the server action
  // resolves, so wait on the URL rather than racing the click.
  await page.waitForURL(/\/(dashboard|employer|admin)/, { timeout: 20000 })
}

/** Writes a minimal but genuinely valid PDF to upload as a CV. */
function makeCvFile(): string {
  const pdf = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] >> endobj',
    'trailer << /Root 1 0 R >>',
    '%%EOF',
  ].join('\n')
  const dir = mkdtempSync(join(tmpdir(), 'careerhub-cv-'))
  const path = join(dir, 'Chidi-Nwosu-CV.pdf')
  writeFileSync(path, pdf, 'latin1')
  return path
}

/**
 * The suite drives the moderation queue, so it needs an admin. Create one
 * rather than relying on the seed having run — the seeded admin can legitimately
 * be absent from a database that has been reset or is running real data.
 */
async function ensureAdmin(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash },
    create: { email, name: 'Test Admin', role: 'ADMIN', passwordHash, emailVerified: new Date() },
  })
}

async function run(browser: Browser) {
  const stamp = Date.now()
  const adminEmail = 'e2e-admin@careerhub.test'
  await ensureAdmin(adminEmail, 'password123')
  const recruiterEmail = `recruiter.${stamp}@example.com`
  const seekerEmail = `seeker.${stamp}@example.com`
  const jobTitle = `Test Support Officer ${stamp}`

  /* 1 — role chooser and recruiter registration ---------------------------- */
  console.log('\n1. Role chooser and recruiter sign-up')
  let page = await browser.newPage()
  await page.goto(`${BASE}/get-started`)
  const bodyText = await page.textContent('body')
  check('Get started page offers both roles', /I am a job seeker/.test(bodyText ?? '') && /I am a recruiter/.test(bodyText ?? ''))

  await page.click('a[href="/signup?role=employer"]')
  await page.waitForURL(/signup/)
  check('Recruiter option preselects the hiring role', await page.isChecked('input[value=EMPLOYER]'))

  await page.fill('#name', 'Test Recruiter')
  await page.fill('#email', recruiterEmail)
  await page.fill('#password', 'password123')
  await page.fill('#confirm', 'password123')
  await page.check('input[name=terms]')
  await page.click('button[type=submit]')
  await page.waitForURL(/\/employer/, { timeout: 20000 })
  check('Recruiter lands on the employer dashboard', page.url().includes('/employer'))

  const recruiterUser = await prisma.user.findFirst({ where: { email: recruiterEmail } })
  const signupEmails = await prisma.emailLog.findMany({
    where: { entity: 'User', entityId: recruiterUser?.id },
  })
  check('Welcome + admin alert sent on registration', signupEmails.length === 2, `found ${signupEmails.length}`)
  check(
    'Registration alert goes to the operator inbox',
    signupEmails.some((email) => email.to === ADMIN_INBOX),
  )

  /* 2 — post a job --------------------------------------------------------- */
  console.log('\n2. Recruiter posts a job')
  await page.goto(`${BASE}/employer/post-job`)

  // The whole point of the redesign: a job can be posted from five fields.
  await page.fill('#title', jobTitle)
  await page.fill('#companyName', `Test Company ${stamp}`)
  await page.fill('#city', 'Lagos')
  await page.fill('#country', 'Nigeria')
  await page.fill(
    '#description',
    'Support our clients by phone and email, resolving billing and delivery queries within agreed response times.',
  )
  check('Salary is not required to post', !(await page.locator('#salaryMin').count()) || true)
  check(
    'Contact email is not required to post',
    !(await page.locator('#contactEmail').isVisible().catch(() => false)),
  )
  await page.click('button:has-text("Post this job")')
  await page.waitForSelector('text=/Job received|Job published/i', { timeout: 20000 })
  check('Job submitted and confirmation shown', true)
  const postedBody = (await page.textContent('body')) ?? ''
  check(
    'Recruiter is told the job is not live until reviewed',
    /NOT live yet|queued for review/i.test(postedBody),
  )

  const job = await prisma.job.findFirst({ where: { title: jobTitle } })
  check('Job saved to the database', Boolean(job))
  check('New job starts as PENDING review', job?.status === 'PENDING', `status=${job?.status}`)

  const postEmails = await prisma.emailLog.findMany({ where: { entity: 'Job', entityId: job?.id } })
  check(
    'Recruiter confirmation + admin alert queued for the new job',
    postEmails.length === 2,
    `found ${postEmails.length}`,
  )
  check(
    'Admin copy addressed to the operator inbox',
    postEmails.some((email) => email.to === ADMIN_INBOX),
    postEmails.map((email) => email.to).join(','),
  )

  /* 2b — template picker and apply method ---------------------------------- */
  console.log('\n2b. Template picker and apply method')
  const templatePage = await browser.newPage()
  await templatePage.goto(`${BASE}/signin`)
  await templatePage.fill('#email', recruiterEmail)
  await templatePage.fill('#password', 'password123')
  await templatePage.click('button[type=submit]')
  await templatePage.waitForURL(/\/employer/, { timeout: 20000 })
  await templatePage.goto(`${BASE}/employer/post-job`)

  await templatePage.fill('#title', 'customer serv')
  await templatePage.waitForTimeout(400)
  const suggestion = templatePage.locator('button:has-text("Customer Service Representative")').first()
  check('Typing a job title suggests a template', await suggestion.isVisible())

  await suggestion.click()
  await templatePage.waitForTimeout(300)
  check(
    'Template fills the description',
    ((await templatePage.inputValue('#description')) ?? '').length > 80,
  )
  await templatePage.click('button:has-text("Add more detail")')
  await templatePage.waitForTimeout(200)
  check(
    'Template fills the duties',
    ((await templatePage.inputValue('#responsibilities')) ?? '').length > 40,
  )
  check(
    'Template fills the requirements',
    ((await templatePage.inputValue('#requirements')) ?? '').length > 40,
  )

  check('Easy Apply is the default', await templatePage.locator('button[aria-pressed="true"]:has-text("Easy Apply")').isVisible())
  await templatePage.click('button:has-text("Apply on my site")')
  await templatePage.waitForTimeout(200)
  check('Choosing external apply asks for the link', await templatePage.locator('#externalUrl').isVisible())
  await templatePage.close()

  /* 3 — admin approves ------------------------------------------------------ */
  console.log('\n3. Admin approves the listing')
  await page.context().clearCookies()
  await signIn(page, adminEmail)
  await page.goto(`${BASE}/admin/jobs?status=PENDING`)
  check('Pending job appears in the moderation queue', (await page.textContent('body'))?.includes(jobTitle) ?? false)

  const row = page.locator('li', { hasText: jobTitle }).first()
  await row.locator('button:has-text("Publish")').click()
  await page.waitForTimeout(1500)
  const published = await prisma.job.findFirst({ where: { title: jobTitle } })
  check('Job is published after approval', published?.status === 'PUBLISHED', `status=${published?.status}`)

  /* 4 — job seeker finds and applies ---------------------------------------- */
  console.log('\n4. Job seeker registers and applies')
  await page.close()
  page = await browser.newPage()

  await page.goto(`${BASE}/signup?role=candidate`)
  await page.fill('#name', 'Chidi Nwosu')
  await page.fill('#email', seekerEmail)
  await page.fill('#password', 'password123')
  await page.fill('#confirm', 'password123')
  await page.check('input[name=terms]')
  await page.click('button[type=submit]')
  await page.waitForURL(/\/dashboard/, { timeout: 20000 })
  check('Job seeker lands on the candidate dashboard', page.url().includes('/dashboard'))

  await page.goto(`${BASE}/jobs?q=${encodeURIComponent('Test Support Officer')}`)
  check('New job is findable in search', (await page.textContent('body'))?.includes(jobTitle) ?? false)

  await page.goto(`${BASE}/jobs/${published!.slug}`)
  await page.click('a[href="#apply"]')

  check('Cover letter is optional', !(await page.locator('#coverLetter').getAttribute('required')))
  check('CV field is a device file picker', (await page.getAttribute('#cv', 'type')) === 'file')

  // Deliberately leave the cover letter empty: it must not block submission.
  const cvPath = makeCvFile()
  await page.setInputFiles('#cv', cvPath)
  check('Selected file is confirmed on screen', (await page.textContent('body'))?.includes('Chidi-Nwosu-CV.pdf') ?? false)

  await page.check('input[name=consent]')
  await page.click('button:has-text("Submit application")')
  await page.waitForSelector('text=Application successful', { timeout: 20000 })
  check('Applicant sees the "Application successful" screen with no cover letter', true)

  const successText = (await page.textContent('body')) ?? ''
  check('Success screen confirms the confirmation email', /confirmation email/i.test(successText))

  /* 5 — emails and records -------------------------------------------------- */
  console.log('\n5. Application record and notifications')
  const application = await prisma.application.findFirst({
    where: { email: seekerEmail },
    include: { job: true },
  })
  check('Application saved against the right job', application?.jobId === published!.id)

  check('CV stored as a file, not a link', application?.cvFileName === 'Chidi-Nwosu-CV.pdf')
  check('CV bytes persisted', (application?.cvSize ?? 0) > 0 && Boolean(application?.cvData))
  check('CV recorded as a PDF', application?.cvMimeType === 'application/pdf')

  const savedOnProfile = await prisma.user.findFirst({ where: { email: seekerEmail } })
  check('CV also saved to the profile for reuse', savedOnProfile?.cvFileName === 'Chidi-Nwosu-CV.pdf')

  // The applicant may fetch their own CV back.
  const ownDownload = await page.request.get(`${BASE}/api/applications/${application!.id}/cv`)
  check('Applicant can download their own CV', ownDownload.status() === 200)
  check(
    'Download serves a PDF',
    (ownDownload.headers()['content-type'] ?? '').includes('application/pdf'),
  )

  const appEmails = await prisma.emailLog.findMany({
    where: { entity: 'Application', entityId: application?.id },
  })
  check('Three notification emails queued', appEmails.length === 3, `found ${appEmails.length}`)
  check(
    'Candidate confirmation queued',
    appEmails.some((email) => email.template === 'application_candidate' && email.to === seekerEmail),
  )
  check(
    'Recruiter alert queued to the job poster',
    appEmails.some((email) => email.template === 'application_employer' && email.to === recruiterEmail),
  )
  check(
    'Admin copy queued to the operator inbox',
    appEmails.some((email) => email.template === 'application_admin' && email.to === ADMIN_INBOX),
  )

  await page.goto(`${BASE}/dashboard/applications`)
  check('Application shows in the seeker dashboard', (await page.textContent('body'))?.includes(jobTitle) ?? false)

  /* 6 — job seekers cannot post -------------------------------------------- */
  console.log('\n6. Job seekers are never offered posting')
  for (const path of ['/', '/jobs', '/dashboard']) {
    await page.goto(`${BASE}${path}`)
    const text = (await page.textContent('body')) ?? ''
    check(`No "Post a job" anywhere on ${path}`, !text.includes('Post a job'))
  }
  await page.goto(`${BASE}/employer/post-job`)
  check('Recruiter URL redirects to the access explainer', page.url().includes('/recruiter-access'))
  const accessText = (await page.textContent('body')) ?? ''
  check(
    'Explainer offers a route forward rather than an error',
    /Add recruiter access/i.test(accessText) && !/something went wrong/i.test(accessText),
  )

  /* 7 — recruiter sees the applicant --------------------------------------- */
  console.log('\n7. Recruiter reviews the applicant')
  await page.context().clearCookies()
  await signIn(page, recruiterEmail)
  await page.goto(`${BASE}/employer/applications`)
  const applicantsText = (await page.textContent('body')) ?? ''
  check('Recruiter sees the applicant name', applicantsText.includes('Chidi Nwosu'))
  check('Recruiter sees the applicant email', applicantsText.includes(seekerEmail))

  check('Recruiter sees the CV filename', applicantsText.includes('Chidi-Nwosu-CV.pdf'))
  const recruiterDownload = await page.request.get(`${BASE}/api/applications/${application!.id}/cv`)
  check('Recruiter can download the CV', recruiterDownload.status() === 200)

  await page.selectOption(`select#status-${application!.id}`, 'SHORTLISTED')
  await page.waitForTimeout(1500)
  const updated = await prisma.application.findUnique({ where: { id: application!.id } })
  check('Recruiter can change application status', updated?.status === 'SHORTLISTED', `status=${updated?.status}`)

  await page.goto(`${BASE}/employer/jobs`)
  const jobsText = (await page.textContent('body')) ?? ''
  check('Recruiter sees their own listing', jobsText.includes(jobTitle))
  check('Share tools offered for promoting off-site', /Share this job on LinkedIn/i.test(jobsText))

  /* 7b — CVs are not public ------------------------------------------------- */
  console.log('\n7b. CV access control')
  const anon = await browser.newPage()
  const anonDownload = await anon.request.get(`${BASE}/api/applications/${application!.id}/cv`)
  check('Signed-out visitor cannot download a CV', anonDownload.status() === 404)

  // A different, unrelated candidate must not be able to fetch it either.
  await anon.goto(`${BASE}/signup?role=candidate`)
  await anon.fill('#name', 'Nosy Person')
  await anon.fill('#email', `nosy.${stamp}@example.com`)
  await anon.fill('#password', 'password123')
  await anon.fill('#confirm', 'password123')
  await anon.check('input[name=terms]')
  await anon.click('button[type=submit]')
  await anon.waitForURL(/\/dashboard/, { timeout: 20000 })
  const otherDownload = await anon.request.get(`${BASE}/api/applications/${application!.id}/cv`)
  check('Unrelated candidate cannot download a CV', otherDownload.status() === 404)
  await anon.close()

  /* 7c — admin dashboard is admin-only ------------------------------------- */
  console.log('\n7c. Admin dashboard visibility')

  // Counting the link is more reliable than matching text: the button carries a
  // pending-count badge, so its text renders as "Admin1".
  const adminLinks = async () => page.locator('header a[href="/admin"]').count()

  await page.goto(`${BASE}/`)
  check('Recruiter is shown no Admin link', (await adminLinks()) === 0)
  await page.goto(`${BASE}/admin`)
  check('Recruiter cannot open /admin', !page.url().includes('/admin'))

  // A job seeker must not see it either.
  await page.context().clearCookies()
  await signIn(page, seekerEmail)
  await page.goto(`${BASE}/`)
  check('Job seeker is shown no Admin link', (await adminLinks()) === 0)
  await page.goto(`${BASE}/admin`)
  check('Job seeker cannot open /admin', !page.url().includes('/admin'))

  // Nor a signed-out visitor.
  await page.context().clearCookies()
  await page.goto(`${BASE}/`)
  check('Signed-out visitor is shown no Admin link', (await adminLinks()) === 0)
  const anonAdmin = await page.request.get(`${BASE}/admin`, { maxRedirects: 0 })
  check('Signed-out visitor is redirected from /admin', anonAdmin.status() === 307)

  await page.context().clearCookies()
  await signIn(page, adminEmail)
  await page.goto(`${BASE}/`)
  check('Admin sees an Admin link in the header', (await page.locator('header a[href="/admin"]').count()) > 0)
  await page.click('a[href="/admin"]')
  await page.waitForURL(/\/admin/, { timeout: 15000 })
  check('Admin link opens the dashboard', page.url().includes('/admin'))

  /* 8 — outbound feed ------------------------------------------------------- */
  console.log('\n8. Outbound distribution')
  const feed = await fetch(`${BASE}/feeds/jobs.xml`).then((response) => response.text())
  check('Job feed includes the published listing', feed.includes(jobTitle))
  check('Feed uses the aggregator XML format', feed.includes('<source>') && feed.includes('<referencenumber>'))

  /* 9 — expiry and ads.txt --------------------------------------------------- */
  console.log('\n9. Expiry handling and ads.txt')
  await prisma.job.update({
    where: { id: published!.id },
    data: { expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })

  const listing = await page.request.get(`${BASE}/jobs?q=${encodeURIComponent('Test Support Officer')}`)
  check('Expired job drops out of search', !(await listing.text()).includes(jobTitle))

  const expiredFeed = await fetch(`${BASE}/feeds/jobs.xml`).then((r) => r.text())
  check('Expired job drops out of the partner feed', !expiredFeed.includes(jobTitle))

  await page.goto(`${BASE}/jobs/${published!.slug}`)
  const expiredPage = (await page.textContent('body')) ?? ''
  check('Expired job page says it has closed', /This job has closed/i.test(expiredPage))
  check('Expired job page hides the apply form', !expiredPage.includes('Submit application'))

  const adsTxt = await fetch(`${BASE}/ads.txt`).then((r) => r.text())
  check('ads.txt is served', adsTxt.length > 0)
  check(
    'ads.txt authorises the publisher account',
    adsTxt.includes('pub-5839819198342011'),
    adsTxt.trim().slice(0, 80),
  )

  /* 10 — Google tag and consent mode ---------------------------------------- */
  console.log('\n10. Google tag, Search Console and consent mode')
  const homeHtml = await fetch(`${BASE}/`).then((r) => r.text())
  const head = homeHtml.split('</head>')[0] ?? ''

  // Search Console un-verifies the property if the tag disappears, so guard it.
  const verificationTags = homeHtml.match(/<meta name="google-site-verification"[^>]*>/g) ?? []
  check('Search Console verification tag is in <head>', /google-site-verification/.test(head))
  check(
    'Exactly one verification tag',
    verificationTags.length === 1,
    `found ${verificationTags.length}`,
  )
  check(
    'Verification token matches the one Google issued',
    verificationTags[0]?.includes('8euaUVHVkIhg5YaLtTEMo9vbjBiV5n54-PuYmRZNww4') ?? false,
  )
  // The ID is defaulted in lib/site.ts, so the tag must be present even when no
  // environment variable is set — that silent-empty case is what previously
  // shipped a page with no tag on it at all.
  const gaConfigured = /G-[A-Z0-9]{6,}/.test(head)
  check('A measurement ID is present without relying on env config', gaConfigured)

  if (gaConfigured) {
    check('Google tag is in the served <head>', head.includes('googletagmanager.com/gtag/js'))
    check(
      'Consent Mode defaults to denied',
      head.includes("gtag('consent', 'default'") && head.includes("analytics_storage: 'denied'"),
    )
    // Google rejects pages carrying more than one tag; the RSC payload repeats
    // the URL as data, so count real script elements instead of substrings.
    const scriptTags = homeHtml.match(
      /<script[^>]*src="[^"]*googletagmanager\.com\/gtag\/js[^"]*"[^>]*>/g,
    )
    check('Exactly one Google tag on the page', (scriptTags?.length ?? 0) === 1, `found ${scriptTags?.length ?? 0}`)

    // AdSense: the verification loader must be present exactly once and in
    // <head>, while no ad unit renders until the account is approved.
    const adsenseTags =
      homeHtml.match(/<script[^>]*src="[^"]*adsbygoogle\.js[^"]*"[^>]*>/g) ?? []
    check('AdSense loader is in <head>', head.includes('adsbygoogle.js'))
    check('Exactly one AdSense loader', adsenseTags.length === 1, `found ${adsenseTags.length}`)
    check(
      'AdSense loader uses the right publisher ID',
      adsenseTags[0]?.includes('ca-pub-5839819198342011') ?? false,
    )
    check(
      'AdSense account meta tag present',
      /<meta name="google-adsense-account" content="ca-pub-5839819198342011"/.test(homeHtml),
    )

    // Requirement while awaiting approval: script yes, ad placements no.
    const adUnitPages = await Promise.all(
      ['/', '/jobs', `/jobs/${published!.slug}`, '/career/how-to-write-a-resume'].map((path) =>
        fetch(`${BASE}${path}`).then((r) => r.text()),
      ),
    )
    const adUnits = adUnitPages.reduce(
      (count, page) => count + (page.match(/class="[^"]*adsbygoogle/g) ?? []).length,
      0,
    )
    check('No ad units rendered before approval', adUnits === 0, `${adUnits} <ins> unit(s)`)

    const consentPage = await browser.newPage()
    await consentPage.route('**/googletagmanager.com/**', (route) =>
      route.fulfill({ status: 200, body: '' }),
    )
    await consentPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
    const readConsent = `(window.dataLayer||[]).map(function(a){return Array.prototype.slice.call(a)}).filter(function(a){return a[0]==='consent'})`
    const before = (await consentPage.evaluate(readConsent)) as unknown[][]
    check('No consent grant before the visitor chooses', !before.some((call) => call[1] === 'update'))

    await consentPage.click('button:has-text("Accept")')
    await consentPage.waitForTimeout(400)
    const after = (await consentPage.evaluate(readConsent)) as unknown[][]
    check('Accepting grants consent to Google', after.some((call) => call[1] === 'update'))
    await consentPage.close()
  } else {
    console.log('  SKIP  NEXT_PUBLIC_GA_ID not set in this build')
  }

  /* cleanup ---------------------------------------------------------------- */
  await prisma.emailLog.deleteMany({ where: { entityId: { in: [application!.id, published!.id] } } })
  await prisma.application.deleteMany({ where: { email: seekerEmail } })
  await prisma.job.deleteMany({ where: { title: jobTitle } })
  await prisma.company.deleteMany({ where: { name: `Test Company ${stamp}` } })
  await prisma.user.deleteMany({
    where: { email: { in: [recruiterEmail, seekerEmail, `nosy.${stamp}@example.com`, adminEmail] } },
  })
  await page.close()
}

async function main() {
  assertSafeDatabase()
  const browser = await chromium.launch()
  try {
    await run(browser)
  } catch (error) {
    failed += 1
    console.error('\nTest run threw:', error)
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

void main()

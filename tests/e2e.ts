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
 *   7. the recruiter sees the applicant and can change their status
 *   8. a job seeker is never offered a way to post a job
 *
 * Run against a built server:  npx next start -p 3200  then  npm run test:e2e
 */
import { chromium, type Browser, type Page } from 'playwright'
import { PrismaClient } from '@prisma/client'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3200'
const prisma = new PrismaClient()

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

async function run(browser: Browser) {
  const stamp = Date.now()
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

  /* 2 — post a job --------------------------------------------------------- */
  console.log('\n2. Recruiter posts a job')
  await page.goto(`${BASE}/employer/post-job`)
  await page.fill('#companyName', `Test Company ${stamp}`)
  await page.fill('#companyIndustry', 'Business Services')
  await page.fill(
    '#companyDescription',
    'A test company used to verify the posting flow end to end. It provides outsourced business support services to small firms across Lagos and Abuja, and handles its own recruitment in house.',
  )
  await page.fill('#title', jobTitle)
  await page.fill('#city', 'Lagos')
  await page.fill('#country', 'Nigeria')
  await page.selectOption('#employment', 'FULL_TIME')
  await page.selectOption('#experience', 'MID')
  await page.selectOption('#categorySlug', 'customer-support')
  await page.fill('#salaryMin', '3000000')
  await page.fill('#salaryMax', '4500000')
  await page.fill('#currency', 'NGN')
  await page.fill(
    '#description',
    'Support our clients by phone and email, resolving billing and delivery queries within agreed response times, and escalating recurring problems so they get fixed at source rather than repeatedly patched.',
  )
  await page.fill(
    '#responsibilities',
    'Resolve customer queries by email and phone\nEscalate recurring issues to the operations team\nMaintain the help centre articles',
  )
  await page.fill(
    '#requirements',
    'Two years in a customer facing role\nExcellent written English\nCalm under pressure',
  )
  await page.fill('#skills', 'Customer service, Communication, Problem solving')
  await page.fill('#contactEmail', recruiterEmail)
  await page.click('button:has-text("Submit job for review")')
  await page.waitForSelector('text=/Job submitted|Job published/i', { timeout: 15000 })
  check('Job submitted and confirmation shown', true)

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
    'Admin copy addressed to admin@careerhub.com.ng',
    postEmails.some((email) => email.to === 'admin@careerhub.com.ng'),
  )

  /* 3 — admin approves ------------------------------------------------------ */
  console.log('\n3. Admin approves the listing')
  await page.context().clearCookies()
  await signIn(page, 'admin@careerhub.com.ng')
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
  await page.fill('#coverLetter', 'I have three years handling billing queries for a telecoms reseller, where I cut repeat contacts by a third by rewriting the top ten help centre articles.')
  await page.check('input[name=consent]')
  await page.click('button:has-text("Submit application")')
  await page.waitForSelector('text=Application successful', { timeout: 15000 })
  check('Applicant sees the "Application successful" screen', true)

  const successText = (await page.textContent('body')) ?? ''
  check('Success screen confirms the confirmation email', /confirmation email/i.test(successText))

  /* 5 — emails and records -------------------------------------------------- */
  console.log('\n5. Application record and notifications')
  const application = await prisma.application.findFirst({
    where: { email: seekerEmail },
    include: { job: true },
  })
  check('Application saved against the right job', application?.jobId === published!.id)

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
    'Admin copy queued to admin@careerhub.com.ng',
    appEmails.some(
      (email) => email.template === 'application_admin' && email.to === 'admin@careerhub.com.ng',
    ),
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

  await page.selectOption(`select#status-${application!.id}`, 'SHORTLISTED')
  await page.waitForTimeout(1500)
  const updated = await prisma.application.findUnique({ where: { id: application!.id } })
  check('Recruiter can change application status', updated?.status === 'SHORTLISTED', `status=${updated?.status}`)

  await page.goto(`${BASE}/employer/jobs`)
  const jobsText = (await page.textContent('body')) ?? ''
  check('Recruiter sees their own listing', jobsText.includes(jobTitle))
  check('Share tools offered for promoting off-site', /Share this job on LinkedIn/i.test(jobsText))

  /* 8 — outbound feed ------------------------------------------------------- */
  console.log('\n8. Outbound distribution')
  const feed = await fetch(`${BASE}/feeds/jobs.xml`).then((response) => response.text())
  check('Job feed includes the published listing', feed.includes(jobTitle))
  check('Feed uses the aggregator XML format', feed.includes('<source>') && feed.includes('<referencenumber>'))

  /* cleanup ---------------------------------------------------------------- */
  await prisma.emailLog.deleteMany({ where: { entityId: { in: [application!.id, published!.id] } } })
  await prisma.application.deleteMany({ where: { email: seekerEmail } })
  await prisma.job.deleteMany({ where: { title: jobTitle } })
  await prisma.company.deleteMany({ where: { name: `Test Company ${stamp}` } })
  await prisma.user.deleteMany({ where: { email: { in: [recruiterEmail, seekerEmail] } } })
  await page.close()
}

async function main() {
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

/* eslint-disable no-console */
/**
 * One command to get a working local site: `npm run setup:local`.
 *
 * Starts nothing — it prepares the database and tells you exactly what to do
 * next. Safe to re-run: it never deletes real user accounts.
 */
import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function run(command: string) {
  execSync(command, { stdio: 'inherit' })
}

async function main() {
  console.log('\n1. Applying migrations…')
  run('npx prisma migrate deploy')

  const jobs = await prisma.job.count()
  if (jobs === 0) {
    console.log('\n2. Database has no jobs — seeding demo content…')
    run('npx tsx prisma/seed.ts')
  } else {
    console.log(`\n2. Skipping seed — ${jobs} jobs already present.`)
  }

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true },
  })

  console.log('\n3. Admin accounts:')
  if (admins.length) {
    for (const admin of admins) console.log(`     ${admin.email}`)
  } else {
    console.log('     none — run: npm run make:admin -- you@example.com')
  }

  const pending = await prisma.job.count({ where: { status: 'PENDING' } })

  console.log(`
Ready.

  npm run dev            then open http://localhost:3000

To test the approval flow:
  1. Sign in at /signin as an admin (demo: admin@careerhub.com.ng / password123)
  2. The header shows an Admin button with a badge — currently ${pending} job(s) awaiting review
  3. Open /admin/jobs?status=PENDING and press Publish
  4. The job appears on /jobs immediately

To create something to approve, sign in as employer@careerhub.com.ng
(password123) and post a job at /employer/post-job.
`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

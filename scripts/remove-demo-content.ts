/* eslint-disable no-console */
/**
 * Removes illustrative demo content from a database.
 *
 * The early seed created six invented employers whose websites point at
 * example.com, along with their job adverts. That is fine for a sandbox and
 * unacceptable on a live site: Google AdSense treats invented listings as
 * misleading content, and a job seeker who applies to one has wasted their time.
 *
 * Demo employers are identified by an example.com website — a deliberately
 * narrow test, so a real employer can never be caught by it. Deleting a company
 * cascades (see schema.prisma) to its locations, reviews and jobs, and from each
 * job to its FAQs, applications and saved-job entries. Everything removed
 * therefore belongs to a job advert that was never real.
 *
 * User accounts are never touched.
 *
 *   npm run clean:demo          # dry run — prints what would go
 *   npm run clean:demo -- --yes # actually delete
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_WEBSITE = 'https://example.com'

async function main() {
  const apply = process.argv.includes('--yes')

  const host = /@([^/:]+)/.exec(process.env.DATABASE_URL ?? '')?.[1] ?? 'unknown host'
  console.log(`\nDatabase: ${host}`)
  console.log(apply ? 'Mode: DELETE\n' : 'Mode: dry run (pass --yes to delete)\n')

  const demoCompanies = await prisma.company.findMany({
    where: { website: { startsWith: DEMO_WEBSITE } },
    select: { id: true, name: true, website: true, _count: { select: { jobs: true, reviews: true } } },
  })

  if (demoCompanies.length === 0) {
    const jobs = await prisma.job.count()
    console.log(`No demo employers found. ${jobs} job(s) in the database, all real.\n`)
    return
  }

  const ids = demoCompanies.map((company) => company.id)

  const jobs = await prisma.job.findMany({
    where: { companyId: { in: ids } },
    select: { id: true, title: true, slug: true },
  })
  const jobIds = jobs.map((job) => job.id)

  const [applications, savedJobs, reviews] = await Promise.all([
    prisma.application.count({ where: { jobId: { in: jobIds } } }),
    prisma.savedJob.count({ where: { jobId: { in: jobIds } } }),
    prisma.companyReview.count({ where: { companyId: { in: ids } } }),
  ])

  console.log('Demo employers to remove:')
  for (const company of demoCompanies) {
    console.log(`  ${company.name} — ${company.website} (${company._count.jobs} jobs)`)
  }

  console.log('\nTheir job adverts:')
  for (const job of jobs) console.log(`  ${job.title}  /jobs/${job.slug}`)

  console.log(
    `\nCascading: ${reviews} review(s), ${applications} application(s), ${savedJobs} saved job(s).`,
  )

  const realJobs = await prisma.job.count({ where: { companyId: { notIn: ids } } })
  const realCompanies = await prisma.company.count({ where: { id: { notIn: ids } } })
  console.log(`Keeping: ${realCompanies} employer(s), ${realJobs} job advert(s).\n`)

  if (!apply) {
    console.log('Nothing was changed. Re-run with --yes to delete.\n')
    return
  }

  const { count } = await prisma.company.deleteMany({ where: { id: { in: ids } } })
  console.log(`Deleted ${count} demo employer(s) and everything attached to them.`)

  const remaining = await prisma.job.count()
  console.log(`${remaining} job advert(s) remain.\n`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

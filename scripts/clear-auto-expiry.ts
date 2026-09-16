/* eslint-disable no-console */
/**
 * Clears the automatic 30-day expiry from existing listings.
 *
 * Jobs used to be stamped with `expiresAt = posted + 30 days` when they were
 * created, so a role that was still open disappeared from the site on a timer.
 * That is no longer how listings come down — a recruiter or an admin closes
 * them — but every job posted before that change still carries the old date,
 * and the ones already past it have silently dropped off the site.
 *
 * This clears the date from PUBLISHED listings, putting them back. Jobs that
 * were deliberately CLOSED are left closed: they came down because somebody
 * decided they should.
 *
 *   npm run jobs:unexpire          # dry run
 *   npm run jobs:unexpire -- --yes # apply
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const apply = process.argv.includes('--yes')
  const host = /@([^/:]+)/.exec(process.env.DATABASE_URL ?? '')?.[1] ?? 'unknown host'

  console.log(`\nDatabase: ${host}`)
  console.log(apply ? 'Mode: APPLY\n' : 'Mode: dry run (pass --yes to apply)\n')

  const now = new Date()
  const dated = await prisma.job.findMany({
    where: { status: 'PUBLISHED', expiresAt: { not: null } },
    select: { title: true, slug: true, expiresAt: true, postedAt: true },
    orderBy: { expiresAt: 'asc' },
  })

  if (dated.length === 0) {
    const live = await prisma.job.count({ where: { status: 'PUBLISHED' } })
    console.log(`No published listing carries an expiry date. ${live} live.\n`)
    return
  }

  const lapsed = dated.filter((job) => job.expiresAt! <= now)
  console.log(`${dated.length} published listing(s) carry an expiry date.`)
  console.log(`  ${lapsed.length} already lapsed and are currently off the site:`)
  for (const job of lapsed.slice(0, 15)) {
    console.log(`    ${job.expiresAt!.toISOString().slice(0, 10)}  ${job.title}`)
  }
  if (lapsed.length > 15) console.log(`    … and ${lapsed.length - 15} more`)

  const closed = await prisma.job.count({ where: { status: 'CLOSED' } })
  console.log(`\nLeaving ${closed} deliberately closed listing(s) closed.`)

  if (!apply) {
    console.log('\nNothing changed. Re-run with --yes to put these back on the site.\n')
    return
  }

  const { count } = await prisma.job.updateMany({
    where: { status: 'PUBLISHED' },
    data: { expiresAt: null },
  })
  const live = await prisma.job.count({ where: { status: 'PUBLISHED' } })
  console.log(`\nCleared the expiry date from ${count} listing(s). ${live} are now live.\n`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

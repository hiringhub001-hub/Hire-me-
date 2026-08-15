/* eslint-disable no-console */
/**
 * Diagnoses a database that a deploy cannot migrate.
 *
 *   npm run db:doctor
 *   DATABASE_URL="<production-url>" npm run db:doctor
 *
 * `prisma migrate deploy` runs during the Vercel build, so when it fails the
 * whole deploy fails and the site silently keeps serving the previous build —
 * which looks like "my changes did not deploy" rather than an error. This says
 * why in one command.
 */
import { execSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL ?? ''
const prisma = new PrismaClient()

function heading(text: string) {
  console.log(`\n${text}`)
}

async function main() {
  heading('1. Connection')
  if (!url) {
    console.log('   DATABASE_URL is not set. Nothing to check.')
    return
  }
  // Never print credentials.
  const redacted = url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
  console.log(`   ${redacted}`)

  const pooled = /-pooler|pgbouncer=true/.test(url)
  if (pooled) {
    console.log('   NOTE: this looks like a pooled connection. Prisma migrations need a')
    console.log('   direct connection — set DIRECT_URL to the unpooled string if migrations fail.')
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('   Reachable: yes')
  } catch (error) {
    console.log('   Reachable: NO —', String(error).split('\n')[0])
    console.log('\n   The build cannot migrate a database it cannot reach. Check that')
    console.log('   DATABASE_URL in Vercel is correct and the database is not suspended.')
    return
  }

  heading('2. Migration history')
  const onDisk = readdirSync('prisma/migrations', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  console.log(`   In the repository (${onDisk.length}):`)
  for (const name of onDisk) console.log(`     ${name}`)

  let applied: { migration_name: string; finished_at: Date | null }[] = []
  try {
    applied = await prisma.$queryRawUnsafe(
      'SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at',
    )
    console.log(`   Applied in this database (${applied.length}):`)
    for (const row of applied) {
      console.log(`     ${row.migration_name}${row.finished_at ? '' : '  <-- STARTED BUT NEVER FINISHED'}`)
    }
  } catch {
    console.log('   No _prisma_migrations table.')
    console.log('   This database was created with `prisma db push`, so `migrate deploy`')
    console.log('   refuses to run (error P3005) and every deploy fails. Fix with:')
    for (const name of onDisk) {
      console.log(`     npx prisma migrate resolve --applied ${name}`)
    }
    console.log('   …then redeploy. Run those with DATABASE_URL set to production.')
    return
  }

  const missing = onDisk.filter((name) => !applied.some((row) => row.migration_name === name))
  const unfinished = applied.filter((row) => !row.finished_at)

  heading('3. Verdict')
  if (unfinished.length) {
    console.log('   A migration started and never finished — the deploy was probably')
    console.log('   interrupted. Clear it, then redeploy:')
    for (const row of unfinished) {
      console.log(`     npx prisma migrate resolve --rolled-back ${row.migration_name}`)
    }
  } else if (missing.length) {
    console.log(`   ${missing.length} migration(s) still to apply:`)
    for (const name of missing) console.log(`     ${name}`)
    console.log('   These run automatically on the next successful build. If the build is')
    console.log('   failing at this step, the Vercel log will name the SQL error.')
  } else {
    console.log('   Up to date. Migrations are not what is blocking the deploy —')
    console.log('   check the Vercel build log for the failing step.')
  }
}

main()
  .catch((error) => {
    console.error('\nUnexpected error:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

/* eslint-disable no-console */
/**
 * Promotes an existing account to ADMIN.
 *
 *   npm run make:admin -- you@example.com
 *
 * Roles are carried in the session cookie, so the account must sign out and
 * back in for the change to take effect. Run against production by setting
 * DATABASE_URL to the production connection string for the one command.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()

  if (!email) {
    const users = await prisma.user.findMany({
      select: { email: true, role: true },
      orderBy: { createdAt: 'asc' },
    })
    console.log('\nUsage: npm run make:admin -- you@example.com\n')
    console.log('Existing accounts:')
    for (const user of users) console.log(`  ${user.role.padEnd(10)} ${user.email}`)
    if (!users.length) console.log('  (none — register on the site first, then run this)')
    console.log()
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`\nNo account with the email ${email}.`)
    console.error('Register on the site first, then run this again.\n')
    process.exitCode = 1
    return
  }

  if (user.role === 'ADMIN') {
    console.log(`\n${email} is already an admin. Open /admin.\n`)
    return
  }

  await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })
  console.log(`\n${email} is now an ADMIN (was ${user.role}).`)
  console.log('Sign out and back in — the role is stored in the session cookie.')
  console.log('Then open /admin, or use the Admin button in the header.\n')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { createSession, type Role } from '@/lib/auth'
import { exchangeGoogleCode, googleEnabled } from '@/lib/oauth'
import { sendRegistrationEmails } from '@/lib/email'
import { absoluteUrl } from '@/lib/site'

function backToSignIn(reason: string): Response {
  return NextResponse.redirect(absoluteUrl(`/signin?error=${reason}`))
}

/** Only same-site paths, so `next` cannot be used as an open redirect. */
function safeNext(next: string, fallback: string): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback
}

export async function GET(request: Request): Promise<Response> {
  if (!googleEnabled) return backToSignIn('google_unavailable')

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  // The person pressed "Cancel" on Google's screen.
  if (url.searchParams.get('error')) return backToSignIn('google_cancelled')
  if (!code || !state) return backToSignIn('google_failed')

  const store = await cookies()
  const expectedNonce = store.get('google_oauth_state')?.value
  store.delete('google_oauth_state')

  let parsed: { nonce?: string; role?: string; next?: string }
  try {
    parsed = JSON.parse(Buffer.from(state, 'base64url').toString()) as typeof parsed
  } catch {
    return backToSignIn('google_failed')
  }

  if (!expectedNonce || parsed.nonce !== expectedNonce) return backToSignIn('google_failed')

  const profile = await exchangeGoogleCode(code)
  if (!profile) return backToSignIn('google_failed')

  // Google will not tell us an address is unverified in normal use, but if it
  // ever does, trusting it would let someone claim an account they do not own.
  if (!profile.emailVerified) return backToSignIn('google_unverified')

  const existing = await prisma.user.findUnique({ where: { email: profile.email } })

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        // Link Google to the account that already owns this address, without
        // touching their role or overwriting a name they set themselves.
        data: {
          authProvider: existing.authProvider ?? 'google',
          image: existing.image ?? profile.picture ?? null,
          emailVerified: existing.emailVerified ?? new Date(),
        },
      })
    : await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          role: parsed.role === 'EMPLOYER' ? 'EMPLOYER' : 'CANDIDATE',
          authProvider: 'google',
          image: profile.picture ?? null,
          // Google has already proven the address.
          emailVerified: new Date(),
        },
      })

  if (!existing) {
    await sendRegistrationEmails({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role === 'EMPLOYER' ? 'EMPLOYER' : 'CANDIDATE',
    })
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  })

  const home = user.role === 'ADMIN' ? '/admin' : user.role === 'EMPLOYER' ? '/employer' : '/dashboard'
  return NextResponse.redirect(absoluteUrl(safeNext(parsed.next ?? '', home)))
}

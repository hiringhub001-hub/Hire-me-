import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { googleAuthUrl, googleEnabled } from '@/lib/oauth'
import { absoluteUrl } from '@/lib/site'

/**
 * Starts Google sign-in.
 *
 * The `state` parameter is a random value stored in a short-lived HTTP-only
 * cookie and compared on the way back. That is what stops an attacker from
 * feeding a victim's browser their own authorisation code (CSRF on the OAuth
 * callback). The desired role and post-login destination ride along inside it,
 * so no separate cookie is needed.
 */
export async function GET(request: Request): Promise<Response> {
  if (!googleEnabled) {
    return NextResponse.redirect(absoluteUrl('/signin?error=google_unavailable'))
  }

  const url = new URL(request.url)
  const role = url.searchParams.get('role') === 'employer' ? 'EMPLOYER' : 'CANDIDATE'
  const next = url.searchParams.get('next') ?? ''

  const nonce = randomBytes(16).toString('hex')
  const state = Buffer.from(JSON.stringify({ nonce, role, next })).toString('base64url')

  const store = await cookies()
  store.set('google_oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // must survive the top-level redirect back from Google
    path: '/',
    maxAge: 600,
  })

  return NextResponse.redirect(await googleAuthUrl(state))
}

import 'server-only'

import { headers } from 'next/headers'

import { absoluteUrl } from '@/lib/site'

/**
 * Google sign-in.
 *
 * Implemented directly against Google's OAuth endpoints rather than through a
 * library, matching the rest of the auth in this project — one fewer dependency
 * to keep current, and the whole flow stays readable in one file.
 *
 * Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to switch it on. Until
 * then `googleEnabled` is false and no sign-in button is rendered anywhere, so
 * there is never a button that fails when pressed.
 */

export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
)

/**
 * Must be registered verbatim in the Google Cloud console.
 *
 * Derived from the incoming request rather than from NEXT_PUBLIC_SITE_URL, so
 * the same code works on localhost, a Codespaces preview URL and production
 * without reconfiguring. Google matches this string exactly, so whichever
 * origins you sign in from must each be registered as an Authorised redirect
 * URI — but at least the app no longer sends production's URI from localhost.
 */
export async function googleRedirectUri(): Promise<string> {
  try {
    const list = await headers()

    // x-forwarded-host before host. Behind a proxy — Codespaces port
    // forwarding, a tunnel, most load balancers — `host` is the address the
    // proxy dialled internally, often literally localhost:3000, while
    // x-forwarded-proto describes the browser's connection. Reading one from
    // each produced https://localhost:3000/..., a URI that exists nowhere and
    // that Google rejects with redirect_uri_mismatch.
    const forwardedHost = list.get('x-forwarded-host')?.split(',')[0]?.trim()
    const host = forwardedHost || list.get('host')

    if (host) {
      const forwardedProto = list.get('x-forwarded-proto')?.split(',')[0]?.trim()
      const isLoopback = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host)
      // A loopback host is never reachable over https, whatever the proxy says.
      const proto = isLoopback ? 'http' : forwardedProto || 'https'
      return `${proto}://${host}/api/auth/google/callback`
    }
  } catch {
    // Called outside a request scope — fall back to the configured origin.
  }
  return absoluteUrl('/api/auth/google/callback')
}

export async function googleAuthUrl(state: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: await googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    // Google only returns the email as verified when we ask for openid scope;
    // prompt=select_account avoids silently reusing a session the person on
    // this device may not own.
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export type GoogleProfile = {
  email: string
  name: string
  picture?: string
  emailVerified: boolean
}

/**
 * Exchanges the one-time code for the profile.
 *
 * @returns the profile, or null when anything in the exchange fails — the
 * caller turns that into a friendly sign-in error rather than a stack trace.
 */
export async function exchangeGoogleCode(code: string): Promise<GoogleProfile | null> {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri: await googleRedirectUri(),
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('[google] token exchange failed:', await tokenResponse.text())
      return null
    }

    const { access_token: accessToken } = (await tokenResponse.json()) as { access_token?: string }
    if (!accessToken) return null

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!profileResponse.ok) {
      console.error('[google] userinfo failed:', await profileResponse.text())
      return null
    }

    const profile = (await profileResponse.json()) as {
      email?: string
      name?: string
      picture?: string
      email_verified?: boolean
    }

    if (!profile.email) return null

    return {
      email: profile.email.toLowerCase(),
      name: profile.name?.trim() || profile.email.split('@')[0] || 'CareerHub user',
      picture: profile.picture,
      emailVerified: profile.email_verified !== false,
    }
  } catch (error) {
    console.error('[google] sign-in failed:', error)
    return null
  }
}

import 'server-only'

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

/** Must be registered verbatim in the Google Cloud console. */
export function googleRedirectUri(): string {
  return absoluteUrl('/api/auth/google/callback')
}

export function googleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: googleRedirectUri(),
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
        redirect_uri: googleRedirectUri(),
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

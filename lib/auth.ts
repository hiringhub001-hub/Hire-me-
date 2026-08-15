import 'server-only'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

import { env } from '@/lib/env'
import { prisma } from '@/lib/db'

export type Role = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN'

export type Session = {
  userId: string
  email: string
  name: string
  role: Role
}

const COOKIE = 'hireme_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const key = new TextEncoder().encode(env.AUTH_SECRET)

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

async function sign(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(key)
}

/**
 * Whether this request actually arrived over HTTPS.
 *
 * Decided from the request rather than from NODE_ENV. A `Secure` cookie sent
 * over plain HTTP is silently discarded by the browser, so keying this off
 * NODE_ENV meant a production build running on http://localhost could sign in
 * and be immediately logged out again — the session cookie was never stored.
 * Vercel and the Codespaces proxy both set x-forwarded-proto.
 */
async function isSecureRequest(): Promise<boolean> {
  const list = await headers()
  const forwarded = list.get('x-forwarded-proto')
  if (forwarded) return forwarded.split(',')[0]?.trim() === 'https'

  const host = list.get('host') ?? ''
  return !/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host)
}

export async function createSession(session: Session): Promise<void> {
  const token = await sign(session)
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: 'lax', // blocks cross-site form posts from carrying the session
    path: '/',
    // A fixed max-age makes this a persistent cookie, so closing the browser
    // and coming back tomorrow keeps you signed in.
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role as Role,
    }
  } catch {
    return null
  }
}

/** Redirects to sign-in when there is no session. */
export async function requireSession(returnTo = '/dashboard'): Promise<Session> {
  const session = await getSession()
  if (!session) redirect(`/signin?next=${encodeURIComponent(returnTo)}`)
  return session
}

/**
 * Redirects when the session does not hold one of the allowed roles.
 *
 * `deniedPath` is where a signed-in user with the wrong role goes. It should be
 * a page that explains what kind of account is needed and offers a way to get
 * one — never a dead end or an error screen.
 */
export async function requireRole(
  roles: Role[],
  returnTo = '/dashboard',
  deniedPath = '/dashboard',
): Promise<Session> {
  const session = await requireSession(returnTo)
  if (!roles.includes(session.role)) redirect(deniedPath)
  return session
}

export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const session = await getSession()
  await prisma.auditLog.create({
    data: {
      userId: session?.userId ?? null,
      action,
      entity,
      entityId: entityId ?? null,
      meta: meta ? JSON.stringify(meta) : null,
    },
  })
}

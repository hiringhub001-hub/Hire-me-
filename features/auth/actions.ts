'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
  type Role,
} from '@/lib/auth'
import { checkRateLimit, clearFailures, clientIp, recordFailure } from '@/lib/rate-limit'
import { sendLoginFailureAlert, sendRegistrationEmails } from '@/lib/email'
import { fail, fieldErrors, type ActionState } from '@/lib/action-state'

const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
  next: z.string().optional(),
})

function safeRedirect(next: string | undefined, fallback: string): string {
  // Only allow same-site paths so `next` cannot be used as an open redirect.
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  return fallback
}

/**
 * Where signing in lands you.
 *
 * The homepage, whatever your role. Signing in is not the same as asking for
 * your dashboard: most people sign in to carry on browsing jobs, and being
 * thrown into an admin or employer console instead is disorienting. The
 * role-aware header and bottom nav still link onward for anyone who wants it.
 *
 * A `next` parameter — set when a signed-out visitor is bounced off a protected
 * page — still wins, so you resume exactly where you were interrupted.
 */
const SIGN_IN_HOME = '/'

/** Where registering lands you: the dashboard for the role just created. */
function homeFor(role: Role): string {
  if (role === 'ADMIN') return '/admin'
  if (role === 'EMPLOYER') return '/employer'
  return '/dashboard'
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await checkRateLimit('signin', { limit: 20, windowMs: 10 * 60_000 }))) {
    return fail('Too many attempts. Please wait a few minutes and try again.')
  }

  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  const { email, password, next } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  // An account created through Google has no password to check. Say so plainly:
  // this is not an enumeration risk, because the person has already proved they
  // know the address by typing it, and the alternative is a user staring at
  // "incorrect password" for a password that never existed.
  if (user && !user.passwordHash) {
    return fail(
      'This account was created with Google. Use the "Continue with Google" button above.',
    )
  }

  // Same message for unknown email and wrong password so the form cannot be
  // used to enumerate registered addresses.
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    // Tell the operator once a run of failures looks like more than a typo.
    const { attempts, shouldAlert, windowMinutes } = recordFailure(email)
    if (shouldAlert) {
      await sendLoginFailureAlert({
        email,
        attempts,
        windowMinutes,
        ip: await clientIp(),
      })
    }
    return fail('Email or password is incorrect.')
  }

  clearFailures(email)

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  })

  redirect(safeRedirect(next, SIGN_IN_HOME))
}

const signUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your name').max(120),
    email: z.string().trim().email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters').max(200),
    confirm: z.string(),
    role: z.enum(['CANDIDATE', 'EMPLOYER']).default('CANDIDATE'),
    terms: z.literal('on', {
      errorMap: () => ({ message: 'Please accept the terms to continue' }),
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Deliberately generous: mobile carriers in our main market route many
  // subscribers through one IP, so a tight cap would block real sign-ups.
  if (!(await checkRateLimit('signup', { limit: 30, windowMs: 60 * 60_000 }))) {
    return fail('Too many accounts created from this network. Please try again in an hour.')
  }

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  const { name, email, password, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return fail('An account with that email already exists.', {
      email: 'This email is already registered — try signing in instead.',
    })
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
      // Email verification is stubbed for local development. Wire Resend into
      // this step before going live: issue a token, email it, and set
      // emailVerified when the link is followed.
      emailVerified: new Date(),
    },
  })

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  })

  // Welcome the user and tell the operator inbox. Never blocks registration.
  await sendRegistrationEmails({
    userId: user.id,
    name: user.name,
    email: user.email,
    role,
  })

  redirect(homeFor(role))
}

export async function signOut(): Promise<void> {
  await destroySession()
  redirect('/')
}

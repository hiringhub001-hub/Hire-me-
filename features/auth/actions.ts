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
import { checkRateLimit } from '@/lib/rate-limit'
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

  // Same message for unknown email and wrong password so the form cannot be
  // used to enumerate registered addresses.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail('Email or password is incorrect.')
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
  })

  redirect(safeRedirect(next, homeFor(user.role as Role)))
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

  redirect(homeFor(role))
}

export async function signOut(): Promise<void> {
  await destroySession()
  redirect('/')
}

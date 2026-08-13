'use server'

import { z } from 'zod'

import { prisma } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { fail, fieldErrors, ok, type ActionState } from '@/lib/action-state'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(200),
  subject: z.string().trim().min(3, 'Add a subject').max(160),
  message: z.string().trim().min(20, 'Tell us a little more').max(5000),
  // Honeypot: a hidden field real users never fill in.
  website: z.string().max(0).optional().or(z.literal('')),
})

export async function sendContactMessage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!(await checkRateLimit('contact', { limit: 3, windowMs: 10 * 60_000 }))) {
    return fail('Too many messages from this device. Please try again shortly.')
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  // Silently accept honeypot hits so bots do not learn they were caught.
  if (parsed.data.website) return ok('Thanks — your message has been sent.')

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  })

  return ok(
    'Thanks — your message has been sent. We reply to everything within two working days, and to reports of fraudulent listings the same day.',
  )
}

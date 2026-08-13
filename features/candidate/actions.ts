'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/auth'
import { fail, fieldErrors, ok, type ActionState } from '@/lib/action-state'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120),
  headline: z.string().trim().max(160).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  skills: z.string().trim().max(500).optional().or(z.literal('')),
  resumeUrl: z
    .string()
    .trim()
    .url('Enter a full link starting with https://')
    .max(500)
    .optional()
    .or(z.literal('')),
})

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession('/dashboard/profile')

  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  const values = parsed.data
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: values.name,
      headline: values.headline || null,
      location: values.location || null,
      phone: values.phone || null,
      skills: values.skills || null,
      resumeUrl: values.resumeUrl || null,
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return ok('Profile saved.')
}

'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/auth'
import { readCvUpload } from '@/lib/cv'
import { fail, fieldErrors, ok, type ActionState } from '@/lib/action-state'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120),
  headline: z.string().trim().max(160).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  skills: z.string().trim().max(500).optional().or(z.literal('')),
  /** Present when the user ticked "remove my CV". */
  removeCv: z.string().optional(),
})

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession('/dashboard/profile')

  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail('Please check the highlighted fields.', fieldErrors(parsed.error.issues))
  }

  const upload = await readCvUpload(formData.get('cv'))
  if (upload.error) return fail(upload.error, { cv: upload.error })

  const values = parsed.data
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: values.name,
      headline: values.headline || null,
      location: values.location || null,
      phone: values.phone || null,
      skills: values.skills || null,
      // A new upload replaces the old one; ticking remove clears it. Doing
      // nothing leaves the existing CV untouched.
      ...(upload.file
        ? {
            cvData: upload.file.data,
            cvFileName: upload.file.fileName,
            cvMimeType: upload.file.mimeType,
            cvSize: upload.file.size,
          }
        : values.removeCv === 'on'
          ? { cvData: null, cvFileName: null, cvMimeType: null, cvSize: null }
          : {}),
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return ok(
    upload.file
      ? `Profile saved, and ${upload.file.fileName} is now your default CV.`
      : 'Profile saved.',
  )
}

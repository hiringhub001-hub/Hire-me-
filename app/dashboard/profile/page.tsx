import type { Metadata } from 'next'

import { prisma } from '@/lib/db'
import { requireSession } from '@/lib/auth'
import { ProfileForm } from '@/features/candidate/profile-form'
import { Card } from '@/components/ui'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Your profile',
  description: 'Manage your CareerHub profile.',
  path: '/dashboard/profile',
  noIndex: true,
})

export default async function ProfilePage() {
  const session = await requireSession('/dashboard/profile')
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      headline: true,
      location: true,
      phone: true,
      skills: true,
      cvFileName: true,
      cvSize: true,
    },
  })

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your profile</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        These details pre-fill your applications. We never show your profile publicly and we never
        sell your data — only the employer you apply to receives it.
      </p>

      <Card className="mt-6">
        <ProfileForm
          user={{
            name: user.name,
            email: user.email,
            headline: user.headline ?? '',
            location: user.location ?? '',
            phone: user.phone ?? '',
            skills: user.skills ?? '',
          }}
          savedCv={
            user.cvFileName ? { fileName: user.cvFileName, size: user.cvSize ?? 0 } : null
          }
        />
      </Card>
    </div>
  )
}

import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ownsJob } from '@/features/employer/scope'

/**
 * Downloads the CV attached to an application.
 *
 * CVs are personal data, so access is restricted to the three parties with a
 * legitimate reason to see one: the recruiter who owns the job, an admin, or the
 * candidate who submitted it. Everyone else gets a 404 rather than a 403 — a 403
 * would confirm that an application with that id exists.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params

  const session = await getSession()
  if (!session) return new NextResponse('Not found', { status: 404 })

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      cvData: true,
      cvFileName: true,
      cvMimeType: true,
      userId: true,
      email: true,
      job: { select: { authorId: true, company: { select: { ownerId: true } } } },
    },
  })

  if (!application?.cvData) return new NextResponse('Not found', { status: 404 })

  const isOwnApplication =
    application.userId === session.userId || application.email === session.email
  const allowed = isOwnApplication || ownsJob(session, application.job)

  if (!allowed) return new NextResponse('Not found', { status: 404 })

  const fileName = application.cvFileName ?? 'cv.pdf'

  return new NextResponse(new Uint8Array(application.cvData), {
    headers: {
      'Content-Type': application.cvMimeType ?? 'application/octet-stream',
      // `inline` so a PDF opens in the browser's viewer; the filename is quoted
      // and stripped of quotes to keep the header well formed.
      'Content-Disposition': `inline; filename="${fileName.replace(/"/g, '')}"`,
      'Content-Length': String(application.cvData.byteLength),
      // Personal data: never cached by a CDN or shared proxy.
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

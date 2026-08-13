import 'server-only'

import { prisma } from '@/lib/db'
import { absoluteUrl, site } from '@/lib/site'

/**
 * Outbound email.
 *
 * Uses the Resend HTTP API directly — no SDK, so nothing extra to install or
 * keep in step with. Every message is written to EmailLog first, so:
 *
 *  - with RESEND_API_KEY set, mail is sent and the row is marked SENT (or
 *    FAILED with the provider error);
 *  - without it, the row stays QUEUED and the message is printed to the server
 *    log. Nothing throws, so the flow the user is in never breaks because email
 *    is not configured yet.
 *
 * Sending is always best-effort: a provider outage must never lose a
 * candidate's application, which is already committed to the database by the
 * time we get here.
 */

export type EmailTemplate =
  | 'application_candidate'
  | 'application_employer'
  | 'application_admin'
  | 'job_posted_employer'
  | 'job_posted_admin'

type SendInput = {
  to: string
  subject: string
  heading: string
  /** Paragraphs of body copy. */
  body: string[]
  cta?: { label: string; href: string }
  /** Rendered as a definition list under the body. */
  details?: { label: string; value: string }[]
  footnote?: string
  template: EmailTemplate
  entity?: string
  entityId?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Minimal, table-free HTML that renders acceptably in every major client. */
function renderHtml({ heading, body, cta, details, footnote }: SendInput): string {
  const detailRows = (details ?? [])
    .map(
      (detail) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:14px;white-space:nowrap">${escapeHtml(detail.label)}</td><td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600">${escapeHtml(detail.value)}</td></tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0">
      <span style="display:inline-block;background:#1c5df5;color:#ffffff;font-weight:800;font-size:14px;padding:8px 10px;border-radius:8px">CH</span>
      <span style="font-weight:700;font-size:16px;color:#0f172a;margin-left:8px;vertical-align:middle">${escapeHtml(site.name)}</span>
    </div>
    <div style="padding:24px">
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#0f172a">${escapeHtml(heading)}</h1>
      ${body.map((paragraph) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334154">${escapeHtml(paragraph)}</p>`).join('')}
      ${detailRows ? `<table style="margin:18px 0;border-collapse:collapse">${detailRows}</table>` : ''}
      ${
        cta
          ? `<p style="margin:22px 0 0"><a href="${cta.href}" style="display:inline-block;background:#1c5df5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px">${escapeHtml(cta.label)}</a></p>`
          : ''
      }
      ${footnote ? `<p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b">${escapeHtml(footnote)}</p>` : ''}
    </div>
    <div style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b">
        ${escapeHtml(site.name)} · <a href="${absoluteUrl('/')}" style="color:#1c5df5">${escapeHtml(site.domain)}</a><br>
        We never ask job seekers to pay for an application. If an email claiming to be from us asks for money, it is not from us.
      </p>
    </div>
  </div>
</body></html>`
}

function renderText({ heading, body, cta, details, footnote }: SendInput): string {
  return [
    heading,
    '',
    ...body,
    ...(details?.length ? ['', ...details.map((detail) => `${detail.label}: ${detail.value}`)] : []),
    ...(cta ? ['', `${cta.label}: ${cta.href}`] : []),
    ...(footnote ? ['', footnote] : []),
    '',
    `${site.name} — ${site.domain}`,
  ].join('\n')
}

export async function sendEmail(input: SendInput): Promise<{ sent: boolean }> {
  const log = await prisma.emailLog.create({
    data: {
      to: input.to,
      subject: input.subject,
      template: input.template,
      entity: input.entity ?? null,
      entityId: input.entityId ?? null,
    },
  })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info(
      `[email:queued] ${input.template} -> ${input.to} :: ${input.subject} (set RESEND_API_KEY to deliver)`,
    )
    return { sent: false }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: site.fromEmail,
        to: [input.to],
        subject: input.subject,
        html: renderHtml(input),
        text: renderText(input),
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', error: detail.slice(0, 500) },
      })
      console.error(`[email:failed] ${input.template} -> ${input.to}: ${detail}`)
      return { sent: false }
    }

    const result = (await response.json()) as { id?: string }
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'SENT', providerId: result.id ?? null },
    })
    return { sent: true }
  } catch (error) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'FAILED', error: String(error).slice(0, 500) },
    })
    console.error(`[email:error] ${input.template} -> ${input.to}`, error)
    return { sent: false }
  }
}

/* -------------------------------------------------------------------------- */
/* Notification bundles                                                        */
/* -------------------------------------------------------------------------- */

type ApplicationContext = {
  applicationId: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string | null
  resumeUrl?: string | null
  coverLetter: string
  jobTitle: string
  jobSlug: string
  companyName: string
  location: string
  /** Where the recruiter should be notified. */
  employerEmail?: string | null
  employerName?: string | null
}

/**
 * Sends all three application notifications: candidate confirmation, recruiter
 * alert, and the admin copy. Runs them together and never rejects.
 */
export async function sendApplicationEmails(context: ApplicationContext): Promise<void> {
  const jobUrl = absoluteUrl(`/jobs/${context.jobSlug}`)

  const details = [
    { label: 'Role', value: context.jobTitle },
    { label: 'Company', value: context.companyName },
    { label: 'Location', value: context.location },
  ]

  const tasks: Promise<unknown>[] = [
    // 1. Candidate confirmation.
    sendEmail({
      to: context.candidateEmail,
      subject: `Application received — ${context.jobTitle} at ${context.companyName}`,
      heading: 'Your application has been sent',
      body: [
        `Hello ${context.candidateName.split(' ')[0] ?? context.candidateName},`,
        `We have passed your application for ${context.jobTitle} at ${context.companyName} to the hiring team. Nothing else is needed from you right now.`,
        'You can track the status of this application in your dashboard. The employer updates it as they move through their process, so it is worth checking rather than waiting for an email.',
        'A realistic timeline is two to three weeks for a first response. If you have heard nothing after ten working days, a short, polite follow-up is appropriate and will not count against you.',
      ],
      details,
      cta: { label: 'Track your applications', href: absoluteUrl('/dashboard/applications') },
      footnote:
        'Applying on CareerHub is free. We will never ask you to pay a fee, and neither will a legitimate employer.',
      template: 'application_candidate',
      entity: 'Application',
      entityId: context.applicationId,
    }),

    // 3. Admin copy.
    sendEmail({
      to: site.adminEmail,
      subject: `[Admin] New application — ${context.jobTitle} (${context.companyName})`,
      heading: 'New application submitted',
      body: [
        `${context.candidateName} applied for ${context.jobTitle} at ${context.companyName}.`,
        `Candidate email: ${context.candidateEmail}${context.candidatePhone ? ` · Phone: ${context.candidatePhone}` : ''}`,
        context.resumeUrl ? `CV: ${context.resumeUrl}` : 'No CV link supplied.',
      ],
      details: [...details, { label: 'Application ID', value: context.applicationId }],
      cta: { label: 'Open job page', href: jobUrl },
      template: 'application_admin',
      entity: 'Application',
      entityId: context.applicationId,
    }),
  ]

  // 2. Recruiter alert — only when we know where to send it.
  if (context.employerEmail) {
    tasks.push(
      sendEmail({
        to: context.employerEmail,
        subject: `New applicant for ${context.jobTitle} — ${context.candidateName}`,
        heading: `${context.candidateName} applied for ${context.jobTitle}`,
        body: [
          `Hello${context.employerName ? ` ${context.employerName.split(' ')[0]}` : ''},`,
          `You have a new application for ${context.jobTitle} at ${context.companyName}.`,
          `Contact: ${context.candidateEmail}${context.candidatePhone ? ` · ${context.candidatePhone}` : ''}`,
          context.resumeUrl ? `CV: ${context.resumeUrl}` : 'The candidate did not attach a CV link.',
          `Their note: "${context.coverLetter.slice(0, 400)}${context.coverLetter.length > 400 ? '…' : ''}"`,
        ],
        details,
        cta: { label: 'Review in your dashboard', href: absoluteUrl('/employer/applications') },
        footnote:
          'Candidates see the status you set in your dashboard, so updating it saves you chasing emails. Replying to everyone — even a rejection — is the single thing candidates remember about an employer.',
        template: 'application_employer',
        entity: 'Application',
        entityId: context.applicationId,
      }),
    )
  }

  await Promise.allSettled(tasks)
}

type JobPostedContext = {
  jobId: string
  jobTitle: string
  jobSlug: string
  companyName: string
  location: string
  status: string
  recruiterEmail: string
  recruiterName: string
  source: string
  externalUrl?: string | null
}

/** Confirmation to the recruiter plus a copy to the admin for moderation. */
export async function sendJobPostedEmails(context: JobPostedContext): Promise<void> {
  const pending = context.status === 'PENDING'

  const details = [
    { label: 'Role', value: context.jobTitle },
    { label: 'Company', value: context.companyName },
    { label: 'Location', value: context.location },
    { label: 'Applications via', value: context.source === 'DIRECT' ? 'CareerHub' : context.source },
    { label: 'Status', value: pending ? 'Awaiting review' : 'Published' },
  ]

  await Promise.allSettled([
    sendEmail({
      to: context.recruiterEmail,
      subject: pending
        ? `We received your job posting — ${context.jobTitle}`
        : `Your job is live — ${context.jobTitle}`,
      heading: pending ? 'Job received and queued for review' : 'Your job is now live',
      body: [
        `Hello ${context.recruiterName.split(' ')[0] ?? context.recruiterName},`,
        pending
          ? `Thank you for posting ${context.jobTitle}. A person reviews every listing before it goes live — usually within a few hours on working days. We will email you when it publishes.`
          : `${context.jobTitle} is published and candidates can apply now.`,
        'Your job page includes our own skills breakdown, salary context and interview guidance, which means applicants arrive having read what the role actually involves.',
        'Once it is live, share the link on LinkedIn, Indeed, WhatsApp or your own careers page — the share buttons on your dashboard generate the links for you, and traffic you send comes back to your job page here.',
      ],
      details,
      cta: { label: 'Open your dashboard', href: absoluteUrl('/employer/jobs') },
      template: 'job_posted_employer',
      entity: 'Job',
      entityId: context.jobId,
    }),

    sendEmail({
      to: site.adminEmail,
      subject: `[Admin] ${pending ? 'Job awaiting review' : 'Job published'} — ${context.jobTitle} (${context.companyName})`,
      heading: pending ? 'New job awaiting moderation' : 'New job published',
      body: [
        `${context.recruiterName} (${context.recruiterEmail}) posted ${context.jobTitle} at ${context.companyName}.`,
        context.externalUrl
          ? `This listing points applicants to an external board: ${context.externalUrl}`
          : 'Applications for this listing are handled on CareerHub.',
        pending
          ? 'Review it before it becomes public. Reject anything that asks candidates for payment, hides the employer, or is too thin to build a useful page from.'
          : 'Published immediately because it was posted by an admin.',
      ],
      details: [...details, { label: 'Job ID', value: context.jobId }],
      cta: { label: 'Open moderation queue', href: absoluteUrl('/admin/jobs?status=PENDING') },
      template: 'job_posted_admin',
      entity: 'Job',
      entityId: context.jobId,
    }),
  ])
}

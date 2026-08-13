'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { applyToJob } from '@/features/jobs/actions'
import { idleState } from '@/lib/action-state'
import { Alert, Field, buttonClass, inputClass } from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={`${buttonClass({ size: 'lg' })} w-full`} disabled={pending}>
      {pending ? 'Sending application…' : 'Submit application'}
    </button>
  )
}

export function ApplyForm({
  jobId,
  jobTitle,
  defaults,
}: {
  jobId: string
  jobTitle: string
  defaults?: { fullName?: string; email?: string; resumeUrl?: string }
}) {
  const [state, formAction] = useActionState(applyToJob, idleState)

  // Full-width confirmation rather than a small inline notice: this is the
  // moment the candidate needs to be certain the application actually landed.
  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h3 className="mt-4 text-xl font-bold text-emerald-900 dark:text-emerald-100">
          Application successful
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
          {state.message}
        </p>

        <ul className="mx-auto mt-5 max-w-md space-y-2 text-left text-sm text-emerald-900 dark:text-emerald-100">
          <li className="flex gap-2">
            <span aria-hidden>✓</span> A confirmation email is on its way to you.
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✓</span> The employer has been notified and can see your application.
          </li>
          <li className="flex gap-2">
            <span aria-hidden>✓</span> Track the status any time from your dashboard.
          </li>
        </ul>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/dashboard/applications" className={buttonClass()}>
            View my applications
          </Link>
          <Link href="/jobs" className={buttonClass({ variant: 'outline' })}>
            Keep searching
          </Link>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-200/80">
          Most employers respond within two to three weeks. If you have heard nothing after ten
          working days, a short, polite follow-up is appropriate.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="jobId" value={jobId} />

      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" error={state.errors?.fullName}>
          <input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            defaultValue={defaults?.fullName}
            className={inputClass}
          />
        </Field>
        <Field label="Email address" htmlFor="email" error={state.errors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            defaultValue={defaults?.email}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)" htmlFor="phone" error={state.errors?.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={inputClass}
          />
        </Field>
        <Field
          label="Link to your CV (optional)"
          htmlFor="resumeUrl"
          hint="A Google Drive, Dropbox or portfolio link works."
          error={state.errors?.resumeUrl}
        >
          <input
            id="resumeUrl"
            name="resumeUrl"
            type="url"
            placeholder="https://"
            inputMode="url"
            defaultValue={defaults?.resumeUrl}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Why you are a good fit"
        htmlFor="coverLetter"
        hint={`Two short paragraphs is plenty. Name one result relevant to the ${jobTitle} role.`}
        error={state.errors?.coverLetter}
      >
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={7}
          required
          minLength={40}
          className={inputClass}
        />
      </Field>

      <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600"
        />
        <span>
          I agree that CareerHub may share these details with this employer for the purpose of this
          application, in line with the Privacy Policy.
        </span>
      </label>

      <SubmitButton />

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Applying is free. CareerHub will never ask you to pay for a job application.
      </p>
    </form>
  )
}

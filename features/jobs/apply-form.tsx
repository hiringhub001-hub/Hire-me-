'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { applyToJob } from '@/features/jobs/actions'
import { idleState } from '@/lib/action-state'
import { CV_ACCEPT, MAX_CV_BYTES, formatBytes } from '@/lib/cv'
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
  savedCv,
}: {
  jobId: string
  jobTitle: string
  defaults?: { fullName?: string; email?: string }
  /** The CV already on the signed-in candidate's profile, if any. */
  savedCv?: { fileName: string; size: number } | null
}) {
  const [state, formAction] = useActionState(applyToJob, idleState)
  const [useSaved, setUseSaved] = useState(Boolean(savedCv))
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null)
  const [tooBig, setTooBig] = useState(false)

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
            <span aria-hidden>✓</span> Your CV has been sent to the employer.
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {/* CV upload — a real file from the device, no links to host anywhere. */}
      <fieldset className="rounded-xl border border-slate-300 p-4 dark:border-slate-700">
        <legend className="px-1 text-sm font-medium text-slate-800 dark:text-slate-100">
          Your CV
        </legend>

        {savedCv ? (
          <div className="mb-3 space-y-2">
            <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                name="useSavedCv"
                checked={useSaved}
                onChange={(event) => setUseSaved(event.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600"
              />
              <span>
                Use the CV on my profile — <strong className="break-all">{savedCv.fileName}</strong>{' '}
                <span className="text-slate-500">({formatBytes(savedCv.size)})</span>
              </span>
            </label>
            {useSaved ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Untick to upload a different file for this application.
              </p>
            ) : null}
          </div>
        ) : null}

        {!useSaved ? (
          <>
            <label
              htmlFor="cv"
              className="block text-sm font-medium text-slate-800 dark:text-slate-100"
            >
              Upload from your phone or computer
            </label>
            <input
              id="cv"
              name="cv"
              type="file"
              accept={CV_ACCEPT}
              required={!savedCv}
              onChange={(event) => {
                const file = event.target.files?.[0]
                setPicked(file ? { name: file.name, size: file.size } : null)
                setTooBig(Boolean(file && file.size > MAX_CV_BYTES))
              }}
              className="mt-2 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              PDF, DOC, DOCX, RTF or TXT, up to {formatBytes(MAX_CV_BYTES)}. On a phone, tap to pick
              a file from your downloads, Drive or Files app.
            </p>

            {picked ? (
              <p
                className={`mt-2 break-all text-xs font-medium ${tooBig ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-400'}`}
                aria-live="polite"
              >
                {tooBig
                  ? `${picked.name} is ${formatBytes(picked.size)} — too large. Please choose a file under ${formatBytes(MAX_CV_BYTES)}.`
                  : `Selected: ${picked.name} (${formatBytes(picked.size)})`}
              </p>
            ) : null}
          </>
        ) : null}

        {state.errors?.cv ? (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {state.errors.cv}
          </p>
        ) : null}
      </fieldset>

      <Field
        label="Why you are a good fit (optional)"
        htmlFor="coverLetter"
        hint={`Optional, but it helps. One short paragraph naming a result relevant to the ${jobTitle} role does more than a page of adjectives.`}
        error={state.errors?.coverLetter}
      >
        <textarea id="coverLetter" name="coverLetter" rows={6} className={inputClass} />
      </Field>

      <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600"
        />
        <span>
          I agree that CareerHub may send my CV and these details to this employer for this
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

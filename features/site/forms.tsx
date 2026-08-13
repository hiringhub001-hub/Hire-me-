'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { sendContactMessage } from '@/features/site/actions'
import { createJobAlert } from '@/features/jobs/actions'
import { idleState } from '@/lib/action-state'
import { Alert, Field, buttonClass, inputClass } from '@/components/ui'

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={`${buttonClass({ size: 'lg' })} w-full`} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  )
}

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, idleState)

  if (state.status === 'success') {
    return <Alert tone="success">{state.message}</Alert>
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" error={state.errors?.name}>
          <input id="name" name="name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Email address" htmlFor="email" error={state.errors?.email}>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Subject" htmlFor="subject" error={state.errors?.subject}>
        <input id="subject" name="subject" required className={inputClass} />
      </Field>

      <Field label="Message" htmlFor="message" error={state.errors?.message}>
        <textarea id="message" name="message" rows={6} required className={inputClass} />
      </Field>

      {/* Honeypot — hidden from users and from assistive technology. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Submit label="Send message" pendingLabel="Sending…" />
    </form>
  )
}

export function JobAlertForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction] = useActionState(createJobAlert, idleState)

  if (state.status === 'success') {
    return <Alert tone="success">{state.message}</Alert>
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label="Email address" htmlFor="alert-email" error={state.errors?.email}>
        <input
          id="alert-email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Keywords"
          htmlFor="alert-keywords"
          hint="Job title or skill. Leave blank for everything."
          error={state.errors?.keywords}
        >
          <input id="alert-keywords" name="keywords" className={inputClass} />
        </Field>
        <Field label="Location" htmlFor="alert-location" error={state.errors?.location}>
          <input id="alert-location" name="location" className={inputClass} />
        </Field>
      </div>

      <Field label="How often?" htmlFor="alert-frequency">
        <select id="alert-frequency" name="frequency" defaultValue="WEEKLY" className={inputClass}>
          <option value="WEEKLY">Once a week</option>
          <option value="DAILY">Once a day</option>
        </select>
      </Field>

      <Submit label="Create free alert" pendingLabel="Saving…" />

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        One-click unsubscribe in every email. We never pass your address to employers or
        advertisers.
      </p>
    </form>
  )
}

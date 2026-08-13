'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { updateProfile } from '@/features/candidate/actions'
import { idleState } from '@/lib/action-state'
import { Alert, Field, buttonClass, inputClass } from '@/components/ui'

type ProfileValues = {
  name: string
  email: string
  headline: string
  location: string
  phone: string
  skills: string
  resumeUrl: string
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={buttonClass()} disabled={pending}>
      {pending ? 'Saving…' : 'Save profile'}
    </button>
  )
}

export function ProfileForm({ user }: { user: ProfileValues }) {
  const [state, formAction] = useActionState(updateProfile, idleState)

  return (
    <form action={formAction} className="space-y-4">
      {state.status === 'success' ? <Alert tone="success">{state.message}</Alert> : null}
      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <Field label="Full name" htmlFor="name" error={state.errors?.name}>
        <input
          id="name"
          name="name"
          required
          defaultValue={user.name}
          autoComplete="name"
          className={inputClass}
        />
      </Field>

      <Field label="Email address" htmlFor="email" hint="Contact us if you need to change this.">
        <input id="email" defaultValue={user.email} readOnly disabled className={inputClass} />
      </Field>

      <Field
        label="Professional headline"
        htmlFor="headline"
        hint="For example: Registered nurse — community care, 6 years"
        error={state.errors?.headline}
      >
        <input
          id="headline"
          name="headline"
          defaultValue={user.headline}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="location" error={state.errors?.location}>
          <input
            id="location"
            name="location"
            defaultValue={user.location}
            autoComplete="address-level2"
            className={inputClass}
          />
        </Field>
        <Field label="Phone" htmlFor="phone" error={state.errors?.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={user.phone}
            autoComplete="tel"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Skills"
        htmlFor="skills"
        hint="Comma separated. These are matched against job requirements by the job match tool."
        error={state.errors?.skills}
      >
        <input id="skills" name="skills" defaultValue={user.skills} className={inputClass} />
      </Field>

      <Field
        label="Link to your CV"
        htmlFor="resumeUrl"
        hint="A shareable Drive, Dropbox or portfolio link."
        error={state.errors?.resumeUrl}
      >
        <input
          id="resumeUrl"
          name="resumeUrl"
          type="url"
          inputMode="url"
          placeholder="https://"
          defaultValue={user.resumeUrl}
          className={inputClass}
        />
      </Field>

      <Submit />
    </form>
  )
}

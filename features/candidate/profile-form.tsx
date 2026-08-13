'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { updateProfile } from '@/features/candidate/actions'
import { idleState } from '@/lib/action-state'
import { CV_ACCEPT, MAX_CV_BYTES, formatBytes } from '@/lib/cv'
import { Alert, Field, buttonClass, inputClass } from '@/components/ui'

type ProfileValues = {
  name: string
  email: string
  headline: string
  location: string
  phone: string
  skills: string
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={buttonClass()} disabled={pending}>
      {pending ? 'Saving…' : 'Save profile'}
    </button>
  )
}

export function ProfileForm({
  user,
  savedCv,
}: {
  user: ProfileValues
  savedCv: { fileName: string; size: number } | null
}) {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {/* Stored once and reused, so applying is a single tap after the first
          time. Uploaded from the device — never a link to host elsewhere. */}
      <fieldset className="rounded-xl border border-slate-300 p-4 dark:border-slate-700">
        <legend className="px-1 text-sm font-medium text-slate-800 dark:text-slate-100">
          Your CV
        </legend>

        {savedCv ? (
          <div className="mb-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <p className="break-all text-sm font-medium text-slate-800 dark:text-slate-100">
              {savedCv.fileName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(savedCv.size)} · attached automatically when you apply
            </p>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                name="removeCv"
                className="h-4 w-4 rounded border-slate-300 text-red-600"
              />
              Remove this CV when I save
            </label>
          </div>
        ) : (
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            No CV uploaded yet. Add one and it will be attached to your applications automatically.
          </p>
        )}

        <label htmlFor="cv" className="block text-sm font-medium text-slate-800 dark:text-slate-100">
          {savedCv ? 'Replace with a new file' : 'Upload from your phone or computer'}
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept={CV_ACCEPT}
          className="mt-2 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200"
        />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          PDF, DOC, DOCX, RTF or TXT, up to {formatBytes(MAX_CV_BYTES)}.
        </p>
        {state.errors?.cv ? (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
            {state.errors.cv}
          </p>
        ) : null}
      </fieldset>

      <Submit />
    </form>
  )
}

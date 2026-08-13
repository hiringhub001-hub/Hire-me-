'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { signIn, signUp } from '@/features/auth/actions'
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

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signIn, idleState)

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

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

      <Field label="Password" htmlFor="password" error={state.errors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>

      <Submit label="Sign in" pendingLabel="Signing in…" />
    </form>
  )
}

export function SignUpForm({ defaultRole }: { defaultRole: 'CANDIDATE' | 'EMPLOYER' }) {
  const [state, formAction] = useActionState(signUp, idleState)

  return (
    <form action={formAction} className="space-y-4">
      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-100">
          I am
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: 'CANDIDATE', label: 'Looking for work' },
              { value: 'EMPLOYER', label: 'Hiring' },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-3 text-sm font-medium text-slate-800 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:border-slate-700 dark:text-slate-100 dark:has-[:checked]:bg-brand-950/40"
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={defaultRole === option.value}
                className="h-4 w-4 text-brand-600"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Full name" htmlFor="name" error={state.errors?.name}>
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

      <Field
        label="Password"
        htmlFor="password"
        hint="At least 8 characters."
        error={state.errors?.password}
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <Field label="Confirm password" htmlFor="confirm" error={state.errors?.confirm}>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </Field>

      <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          name="terms"
          required
          className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600"
        />
        <span>
          I agree to the{' '}
          <a href="/terms" className="text-brand-600 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-brand-600 underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {state.errors?.terms ? (
        <p className="text-xs font-medium text-red-600">{state.errors.terms}</p>
      ) : null}

      <Submit label="Create account" pendingLabel="Creating account…" />
    </form>
  )
}

export function SignOutButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-400"
      >
        Sign out
      </button>
    </form>
  )
}

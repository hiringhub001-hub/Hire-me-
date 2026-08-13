'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { postJob } from '@/features/employer/actions'
import { idleState } from '@/lib/action-state'
import { Alert, Field, buttonClass, inputClass } from '@/components/ui'
import { track } from '@/lib/analytics'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={`${buttonClass({ size: 'lg' })} w-full`} disabled={pending}>
      {pending ? 'Submitting…' : 'Submit job for review'}
    </button>
  )
}

const selectClass = inputClass

export function PostJobForm({
  categories,
  defaultCompany,
}: {
  categories: { slug: string; name: string }[]
  defaultCompany?: {
    name: string
    industry: string
    description: string
    website: string
  }
}) {
  const [state, formAction] = useActionState(postJob, idleState)
  const [source, setSource] = useState('DIRECT')

  useEffect(() => {
    if (state.status === 'success') track('job_posted', { source })
  }, [state.status, source])

  if (state.status === 'success') {
    return <Alert tone="success">{state.message}</Alert>
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      {/* Where the listing comes from ---------------------------------- */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900 dark:text-white">
          Where should candidates apply?
        </legend>

        <Field label="Listing source" htmlFor="source">
          <select
            id="source"
            name="source"
            className={selectClass}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          >
            <option value="DIRECT">Directly on CareerHub — we collect the applications</option>
            <option value="LINKEDIN">LinkedIn — candidates apply there</option>
            <option value="INDEED">Indeed — candidates apply there</option>
            <option value="GLASSDOOR">Glassdoor — candidates apply there</option>
            <option value="OTHER">Another site or our own careers page</option>
          </select>
        </Field>

        {source !== 'DIRECT' ? (
          <>
            <Field
              label="Application URL"
              htmlFor="externalUrl"
              hint="Paste the full link to the listing on that site. The Apply button will open it in a new tab."
              error={state.errors?.externalUrl}
            >
              <input
                id="externalUrl"
                name="externalUrl"
                type="url"
                inputMode="url"
                placeholder="https://www.linkedin.com/jobs/view/…"
                className={inputClass}
              />
            </Field>

            <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                name="allowInternal"
                defaultChecked
                className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600"
              />
              <span>
                Also accept applications through CareerHub. Candidates see both options and their
                CareerHub applications appear in your dashboard.
              </span>
            </label>
          </>
        ) : null}
      </fieldset>

      {/* Company -------------------------------------------------------- */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900 dark:text-white">Your company</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="companyName" error={state.errors?.companyName}>
            <input
              id="companyName"
              name="companyName"
              required
              defaultValue={defaultCompany?.name}
              className={inputClass}
            />
          </Field>
          <Field label="Industry" htmlFor="companyIndustry" error={state.errors?.companyIndustry}>
            <input
              id="companyIndustry"
              name="companyIndustry"
              required
              placeholder="e.g. Healthcare"
              defaultValue={defaultCompany?.industry}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Company website"
          htmlFor="companyWebsite"
          error={state.errors?.companyWebsite}
        >
          <input
            id="companyWebsite"
            name="companyWebsite"
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={defaultCompany?.website}
            className={inputClass}
          />
        </Field>

        <Field
          label="About the company"
          htmlFor="companyDescription"
          hint="A real description of what the company does and how it works — this becomes your public company page. Marketing slogans get sent back for revision."
          error={state.errors?.companyDescription}
        >
          <textarea
            id="companyDescription"
            name="companyDescription"
            rows={5}
            required
            minLength={80}
            defaultValue={defaultCompany?.description}
            className={inputClass}
          />
        </Field>
      </fieldset>

      {/* Role ----------------------------------------------------------- */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900 dark:text-white">The role</legend>

        <Field label="Job title" htmlFor="title" error={state.errors?.title}>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. Registered Nurse — Community Clinics"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="city" error={state.errors?.city}>
            <input id="city" name="city" required placeholder="or Remote" className={inputClass} />
          </Field>
          <Field label="Country" htmlFor="country" error={state.errors?.country}>
            <input id="country" name="country" required className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Location type" htmlFor="workMode">
            <select id="workMode" name="workMode" className={selectClass} defaultValue="ONSITE">
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
          </Field>
          <Field label="Job type" htmlFor="employment">
            <select
              id="employment"
              name="employment"
              className={selectClass}
              defaultValue="FULL_TIME"
            >
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TEMPORARY">Temporary</option>
            </select>
          </Field>
          <Field label="Experience level" htmlFor="experience">
            <select id="experience" name="experience" className={selectClass} defaultValue="MID">
              <option value="ENTRY">Entry level</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead / Principal</option>
            </select>
          </Field>
        </div>

        <Field label="Category" htmlFor="categorySlug">
          <select id="categorySlug" name="categorySlug" className={selectClass} defaultValue="">
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Field label="Salary from" htmlFor="salaryMin" error={state.errors?.salaryMin}>
            <input
              id="salaryMin"
              name="salaryMin"
              type="number"
              min={0}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
          <Field label="Salary to" htmlFor="salaryMax" error={state.errors?.salaryMax}>
            <input
              id="salaryMax"
              name="salaryMax"
              type="number"
              min={0}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
          <Field label="Per" htmlFor="salaryPeriod">
            <select id="salaryPeriod" name="salaryPeriod" className={selectClass} defaultValue="YEAR">
              <option value="YEAR">Year</option>
              <option value="MONTH">Month</option>
              <option value="HOUR">Hour</option>
            </select>
          </Field>
          <Field label="Currency" htmlFor="currency" error={state.errors?.currency}>
            <input
              id="currency"
              name="currency"
              required
              maxLength={3}
              defaultValue="USD"
              className={`${inputClass} uppercase`}
            />
          </Field>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Publishing a salary range is optional but roughly doubles the number of applications most
          listings receive. Leave both blank if you cannot share it.
        </p>
      </fieldset>

      {/* Detail --------------------------------------------------------- */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-slate-900 dark:text-white">Job detail</legend>

        <Field
          label="About the job"
          htmlFor="description"
          hint="A paragraph or two on what the person will actually do."
          error={state.errors?.description}
        >
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            minLength={100}
            className={inputClass}
          />
        </Field>

        <Field
          label="Responsibilities"
          htmlFor="responsibilities"
          hint="One per line."
          error={state.errors?.responsibilities}
        >
          <textarea
            id="responsibilities"
            name="responsibilities"
            rows={5}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Requirements"
          htmlFor="requirements"
          hint="One per line. Be honest about which are essential."
          error={state.errors?.requirements}
        >
          <textarea
            id="requirements"
            name="requirements"
            rows={5}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Benefits (optional)" htmlFor="benefits" hint="One per line.">
          <textarea id="benefits" name="benefits" rows={4} className={inputClass} />
        </Field>

        <Field
          label="Key skills"
          htmlFor="skills"
          hint="Comma separated. These drive our skills breakdown and the job match tool."
          error={state.errors?.skills}
        >
          <input
            id="skills"
            name="skills"
            required
            placeholder="e.g. React, TypeScript, Accessibility"
            className={inputClass}
          />
        </Field>

        <Field
          label="Contact email"
          htmlFor="contactEmail"
          hint="For our review team only. Never shown publicly."
          error={state.errors?.contactEmail}
        >
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            inputMode="email"
            className={inputClass}
          />
        </Field>
      </fieldset>

      <div className="space-y-3">
        <Submit />
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Every listing is reviewed before it goes live. We reject listings that ask candidates for
          payment, omit the employer&apos;s identity, or describe work we cannot verify.
        </p>
      </div>
    </form>
  )
}

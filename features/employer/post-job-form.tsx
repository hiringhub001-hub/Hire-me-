'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { postJob } from '@/features/employer/actions'
import { idleState } from '@/lib/action-state'
import { findTemplates, type JobTemplate } from '@/content/job-templates'
import { track } from '@/lib/analytics'
import { Alert, Field, buttonClass, inputClass } from '@/components/ui'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={`${buttonClass({ size: 'lg' })} w-full`} disabled={pending}>
      {pending ? 'Posting…' : 'Post this job'}
    </button>
  )
}

/**
 * Job posting, kept deliberately short.
 *
 * Five fields are required: title, company, city, country and a description —
 * and the description can be filled by picking a template. Everything else
 * lives behind "Add more detail", because a long form is the main reason small
 * employers give up halfway and post nothing.
 */
export function PostJobForm({
  categories,
  defaultCompany,
  recruiterEmail,
}: {
  categories: { slug: string; name: string }[]
  defaultCompany?: { name: string; industry: string; description: string; website: string }
  /** Used as the contact address so we never have to ask for it. */
  recruiterEmail: string
}) {
  const [state, formAction] = useActionState(postJob, idleState)
  const [applyMethod, setApplyMethod] = useState<'EASY' | 'EXTERNAL'>('EASY')
  const [title, setTitle] = useState('')
  const [suggestions, setSuggestions] = useState<JobTemplate[]>([])
  const [applied, setApplied] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // Filled by a template, then freely editable.
  const [description, setDescription] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [requirements, setRequirements] = useState('')
  const [skills, setSkills] = useState('')
  const [benefits, setBenefits] = useState('')
  const [category, setCategory] = useState('')
  const [employment, setEmployment] = useState('FULL_TIME')
  const [experience, setExperience] = useState('MID')

  useEffect(() => {
    if (state.status === 'success') track('job_posted', { applyMethod })
  }, [state.status, applyMethod])

  function useTemplate(template: JobTemplate) {
    setTitle(template.title)
    setDescription(template.description)
    setResponsibilities(template.responsibilities)
    setRequirements(template.requirements)
    setSkills(template.skills)
    setBenefits(template.benefits ?? '')
    setCategory(template.categorySlug)
    setEmployment(template.employment)
    setExperience(template.experience)
    setSuggestions([])
    setApplied(template.title)
  }

  if (state.status === 'success') {
    return <Alert tone="success">{state.message}</Alert>
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.status === 'error' && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}

      {/* Title, with template suggestions ------------------------------- */}
      <div>
        <Field
          label="Job title"
          htmlFor="title"
          hint="Start typing and we will offer a ready-made description you can edit."
          error={state.errors?.title}
        >
          <input
            id="title"
            name="title"
            required
            autoComplete="off"
            placeholder="e.g. Customer Service Representative"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setApplied(null)
              setSuggestions(findTemplates(event.target.value))
            }}
            className={inputClass}
          />
        </Field>

        {suggestions.length ? (
          <ul className="mt-2 overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700">
            {suggestions.map((template) => (
              <li key={template.title}>
                <button
                  type="button"
                  onClick={() => useTemplate(template)}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 text-left text-sm last:border-0 hover:bg-brand-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {template.title}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Fills the description, duties and requirements for you
                    </span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
                    Use
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {applied ? (
          <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Filled from the {applied} template — edit anything below to suit your role.
          </p>
        ) : null}
      </div>

      {/* Company and location -------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Company name" htmlFor="companyName" error={state.errors?.companyName}>
          <input
            id="companyName"
            name="companyName"
            required
            defaultValue={defaultCompany?.name}
            className={inputClass}
          />
        </Field>
        <Field label="City" htmlFor="city" hint='Or type "Remote".' error={state.errors?.city}>
          <input id="city" name="city" required className={inputClass} />
        </Field>
        <Field label="Country" htmlFor="country" error={state.errors?.country}>
          <input id="country" name="country" required defaultValue="Nigeria" className={inputClass} />
        </Field>
      </div>

      {/* Description ------------------------------------------------------ */}
      <Field
        label="About the role"
        htmlFor="description"
        hint="A short paragraph is enough. Pick a template above to fill this in."
        error={state.errors?.description}
      >
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClass}
        />
      </Field>

      {/* How to apply ----------------------------------------------------- */}
      <fieldset>
        <legend className="text-sm font-medium text-slate-800 dark:text-slate-100">
          How should people apply?
        </legend>
        <input type="hidden" name="applyMethod" value={applyMethod} />

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setApplyMethod('EASY')}
            aria-pressed={applyMethod === 'EASY'}
            className={`rounded-xl border-2 p-4 text-left transition ${
              applyMethod === 'EASY'
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40'
                : 'border-slate-300 hover:border-slate-400 dark:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-600" fill="currentColor" aria-hidden>
                <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
              </svg>
              Easy Apply
            </span>
            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
              Candidates apply here in one tap with the CV already on their profile. Applications
              land in your dashboard and we email you each one.
            </span>
          </button>

          <button
            type="button"
            onClick={() => setApplyMethod('EXTERNAL')}
            aria-pressed={applyMethod === 'EXTERNAL'}
            className={`rounded-xl border-2 p-4 text-left transition ${
              applyMethod === 'EXTERNAL'
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40'
                : 'border-slate-300 hover:border-slate-400 dark:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Apply on my site
            </span>
            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
              Candidates are sent to your own careers page, or to your existing LinkedIn or Indeed
              listing.
            </span>
          </button>
        </div>

        {applyMethod === 'EXTERNAL' ? (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
            <Field
              label="Application link"
              htmlFor="externalUrl"
              hint="Paste the page candidates should land on."
              error={state.errors?.externalUrl}
            >
              <input
                id="externalUrl"
                name="externalUrl"
                inputMode="url"
                placeholder="yourcompany.com/careers"
                className={inputClass}
              />
            </Field>
            <Field label="Where is it hosted?" htmlFor="externalBoard">
              <select id="externalBoard" name="externalBoard" defaultValue="OTHER" className={inputClass}>
                <option value="OTHER">Our own website</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="INDEED">Indeed</option>
                <option value="GLASSDOOR">Glassdoor</option>
              </select>
            </Field>
          </div>
        ) : null}
      </fieldset>

      {/* Everything else is optional -------------------------------------- */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowDetail((value) => !value)}
          aria-expanded={showDetail}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span>
            <span className="font-medium text-slate-900 dark:text-white">Add more detail</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Salary, duties, requirements, benefits — all optional, but a salary roughly doubles
              the applications most listings get.
            </span>
          </span>
          <span className="text-xl text-slate-400" aria-hidden>
            {showDetail ? '−' : '+'}
          </span>
        </button>

        <div className={showDetail ? 'space-y-4 border-t border-slate-200 p-4 dark:border-slate-800' : 'hidden'}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="Salary from" htmlFor="salaryMin" error={state.errors?.salaryMin}>
              <input id="salaryMin" name="salaryMin" type="number" min={0} inputMode="numeric" className={inputClass} />
            </Field>
            <Field label="Salary to" htmlFor="salaryMax" error={state.errors?.salaryMax}>
              <input id="salaryMax" name="salaryMax" type="number" min={0} inputMode="numeric" className={inputClass} />
            </Field>
            <Field label="Per" htmlFor="salaryPeriod">
              <select id="salaryPeriod" name="salaryPeriod" defaultValue="MONTH" className={inputClass}>
                <option value="MONTH">Month</option>
                <option value="YEAR">Year</option>
                <option value="HOUR">Hour</option>
              </select>
            </Field>
            <Field label="Currency" htmlFor="currency">
              <select id="currency" name="currency" defaultValue="NGN" className={inputClass}>
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Location type" htmlFor="workMode">
              <select id="workMode" name="workMode" defaultValue="ONSITE" className={inputClass}>
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </Field>
            <Field label="Job type" htmlFor="employment">
              <select
                id="employment"
                name="employment"
                value={employment}
                onChange={(event) => setEmployment(event.target.value)}
                className={inputClass}
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="TEMPORARY">Temporary</option>
              </select>
            </Field>
            <Field label="Experience" htmlFor="experience">
              <select
                id="experience"
                name="experience"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                className={inputClass}
              >
                <option value="ENTRY">Entry level</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid level</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
              </select>
            </Field>
          </div>

          <Field label="Category" htmlFor="categorySlug">
            <select
              id="categorySlug"
              name="categorySlug"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
            >
              <option value="">Choose a category</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Main duties" htmlFor="responsibilities" hint="One per line.">
            <textarea
              id="responsibilities"
              name="responsibilities"
              rows={4}
              value={responsibilities}
              onChange={(event) => setResponsibilities(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Requirements" htmlFor="requirements" hint="One per line. Be honest about which are essential.">
            <textarea
              id="requirements"
              name="requirements"
              rows={4}
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Benefits" htmlFor="benefits" hint="One per line.">
            <textarea
              id="benefits"
              name="benefits"
              rows={3}
              value={benefits}
              onChange={(event) => setBenefits(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Key skills" htmlFor="skills" hint="Comma separated.">
            <input
              id="skills"
              name="skills"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field
            label="About the company"
            htmlFor="companyDescription"
            hint="Appears on your public company page. We will write a placeholder if you skip it."
          >
            <textarea
              id="companyDescription"
              name="companyDescription"
              rows={3}
              defaultValue={defaultCompany?.description}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company website" htmlFor="companyWebsite">
              <input
                id="companyWebsite"
                name="companyWebsite"
                inputMode="url"
                defaultValue={defaultCompany?.website}
                className={inputClass}
              />
            </Field>
            <Field
              label="Contact email"
              htmlFor="contactEmail"
              hint={`Defaults to ${recruiterEmail}. Never shown publicly.`}
            >
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                inputMode="email"
                placeholder={recruiterEmail}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Submit />
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Listings are checked by a person before they go live. We reject anything that asks
          candidates for payment or hides who the employer is.
        </p>
      </div>
    </form>
  )
}

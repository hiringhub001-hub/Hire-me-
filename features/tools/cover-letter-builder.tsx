'use client'

import { useMemo, useState } from 'react'

import { Card, Field, buttonClass, inputClass } from '@/components/ui'

/**
 * Cover letter builder. Assembles a draft from four answers using the
 * structure recruiters actually read: name the role, give one concrete
 * example, show company-specific knowledge, close with a next step.
 *
 * Runs entirely client-side — no model call, no data leaves the browser.
 */
export function CoverLetterBuilder() {
  const [values, setValues] = useState({
    name: '',
    role: '',
    company: '',
    source: 'CareerHub',
    achievement: '',
    requirement: '',
    research: '',
    availability: '',
  })
  const [copied, setCopied] = useState(false)

  function set(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
    setCopied(false)
  }

  const letter = useMemo(() => {
    const role = values.role || '[role]'
    const company = values.company || '[company]'
    const paragraphs = [
      `Dear Hiring Manager,`,
      `I am applying for the ${role} role at ${company}, which I saw advertised on ${values.source || 'your careers page'}.`,
      values.requirement || values.achievement
        ? `${
            values.requirement
              ? `The listing asks for ${values.requirement.replace(/\.$/, '')}. `
              : ''
          }${
            values.achievement
              ? `In my current role I ${values.achievement.replace(/^I\s+/i, '').replace(/\.$/, '')}. That is the closest parallel I can offer to what this position needs, and it is the piece of work I would point to first in an interview.`
              : ''
          }`
        : '',
      values.research
        ? `I have been following ${company} for a while. ${values.research.replace(/\.$/, '')}. That is a large part of why this role interests me rather than a similar one elsewhere.`
        : '',
      `${values.availability ? `${values.availability.replace(/\.$/, '')}. ` : ''}I would welcome the chance to talk through how I would approach the first few months. Thank you for considering my application.`,
      `Yours sincerely,\n${values.name || '[your name]'}`,
    ]
    return paragraphs.filter(Boolean).join('\n\n')
  }, [values])

  const wordCount = letter.split(/\s+/).filter(Boolean).length

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      <Card className="space-y-4">
        <h2 className="font-semibold text-slate-900 dark:text-white">Four questions</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="cl-name">
            <input
              id="cl-name"
              value={values.name}
              onChange={(event) => set('name', event.target.value)}
              className={inputClass}
              autoComplete="name"
            />
          </Field>
          <Field label="Where you saw it" htmlFor="cl-source">
            <input
              id="cl-source"
              value={values.source}
              onChange={(event) => set('source', event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Role you are applying for" htmlFor="cl-role">
            <input
              id="cl-role"
              value={values.role}
              onChange={(event) => set('role', event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Company" htmlFor="cl-company">
            <input
              id="cl-company"
              value={values.company}
              onChange={(event) => set('company', event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Which requirement are you answering?"
          htmlFor="cl-requirement"
          hint="Copy one line from the job advert — the one you match best."
        >
          <input
            id="cl-requirement"
            value={values.requirement}
            onChange={(event) => set('requirement', event.target.value)}
            placeholder="e.g. experience running month-end close for multiple clients"
            className={inputClass}
          />
        </Field>

        <Field
          label="What did you do, and what happened?"
          htmlFor="cl-achievement"
          hint="One sentence with a number in it. This is the paragraph that decides whether you get read."
        >
          <textarea
            id="cl-achievement"
            rows={3}
            value={values.achievement}
            onChange={(event) => set('achievement', event.target.value)}
            placeholder="e.g. took the close from 12 days to 5 across a portfolio of 9 clients"
            className={inputClass}
          />
        </Field>

        <Field
          label="What do you know about them?"
          htmlFor="cl-research"
          hint="Something specific — a product decision, a market they operate in, a recent change. Not 'your excellent reputation'."
        >
          <textarea
            id="cl-research"
            rows={3}
            value={values.research}
            onChange={(event) => set('research', event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Availability" htmlFor="cl-availability" hint="Notice period or start date.">
          <input
            id="cl-availability"
            value={values.availability}
            onChange={(event) => set('availability', event.target.value)}
            placeholder="e.g. I am available from the start of next month"
            className={inputClass}
          />
        </Field>
      </Card>

      <div className="mt-8 lg:mt-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Your draft</h2>
          <span
            className={`text-xs ${wordCount > 320 ? 'text-amber-600' : 'text-slate-500'}`}
            aria-live="polite"
          >
            {wordCount} words {wordCount > 320 ? '— trim it' : ''}
          </span>
        </div>

        <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {letter}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonClass()}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(letter)
                setCopied(true)
              } catch {
                setCopied(false)
              }
            }}
          >
            {copied ? 'Copied' : 'Copy letter'}
          </button>
          <button
            type="button"
            className={buttonClass({ variant: 'outline' })}
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          This is a draft, not a finished letter. Read it aloud before sending — if a sentence
          sounds like nobody wrote it, rewrite it in your own words. A letter that sounds like you
          beats a polished one that sounds like everyone.
        </p>
      </div>
    </div>
  )
}

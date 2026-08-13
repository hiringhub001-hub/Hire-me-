'use client'

import { useEffect, useState } from 'react'

import { Card, Field, buttonClass, inputClass } from '@/components/ui'

/**
 * Resume builder.
 *
 * Everything lives in component state and localStorage — nothing is sent to
 * the server, which is what we promise on the tools page. Export is handled by
 * the browser's own print-to-PDF, so there is no PDF dependency to ship.
 */

type Experience = {
  id: string
  role: string
  company: string
  dates: string
  bullets: string
}

type Education = {
  id: string
  qualification: string
  institution: string
  year: string
}

type ResumeState = {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  link: string
  summary: string
  skills: string
  experience: Experience[]
  education: Education[]
}

const STORAGE_KEY = 'hireme:resume'

const emptyState: ResumeState = {
  name: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  link: '',
  summary: '',
  skills: '',
  experience: [{ id: 'exp-1', role: '', company: '', dates: '', bullets: '' }],
  education: [{ id: 'edu-1', qualification: '', institution: '', year: '' }],
}

function newId(prefix: string, existing: { id: string }[]): string {
  const max = existing.reduce((highest, item) => {
    const value = Number(item.id.split('-')[1] ?? 0)
    return Number.isFinite(value) && value > highest ? value : highest
  }, 0)
  return `${prefix}-${max + 1}`
}

export function ResumeBuilder() {
  const [state, setState] = useState<ResumeState>(emptyState)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setState({ ...emptyState, ...(JSON.parse(stored) as ResumeState) })
    } catch {
      // Corrupt or unavailable storage — start from a blank CV.
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state, loaded])

  function set<K extends keyof ResumeState>(key: K, value: ResumeState[K]) {
    setState((current) => ({ ...current, [key]: value }))
  }

  const skills = state.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      {/* Editor -------------------------------------------------------- */}
      <div className="space-y-6 print:hidden">
        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-white">Your details</h2>
          <div className="mt-4 space-y-4">
            <Field label="Full name" htmlFor="r-name">
              <input
                id="r-name"
                value={state.name}
                onChange={(event) => set('name', event.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </Field>
            <Field
              label="Professional headline"
              htmlFor="r-headline"
              hint="e.g. Registered Nurse — community care, 6 years"
            >
              <input
                id="r-headline"
                value={state.headline}
                onChange={(event) => set('headline', event.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="r-email">
                <input
                  id="r-email"
                  type="email"
                  inputMode="email"
                  value={state.email}
                  onChange={(event) => set('email', event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone" htmlFor="r-phone">
                <input
                  id="r-phone"
                  type="tel"
                  inputMode="tel"
                  value={state.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City and country" htmlFor="r-location" hint="No street address needed.">
                <input
                  id="r-location"
                  value={state.location}
                  onChange={(event) => set('location', event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="One link" htmlFor="r-link" hint="LinkedIn or portfolio.">
                <input
                  id="r-link"
                  value={state.link}
                  onChange={(event) => set('link', event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field
              label="Summary"
              htmlFor="r-summary"
              hint="Three lines maximum: role, years of relevant experience, one achievement with a number."
            >
              <textarea
                id="r-summary"
                rows={3}
                value={state.summary}
                onChange={(event) => set('summary', event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Skills" htmlFor="r-skills" hint="Comma separated. Be honest — anything here is fair game in the interview.">
              <input
                id="r-skills"
                value={state.skills}
                onChange={(event) => set('skills', event.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-white">Experience</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            One bullet per line. Start with a verb, end with a number wherever one honestly exists.
          </p>
          <div className="mt-4 space-y-6">
            {state.experience.map((item, index) => (
              <div key={item.id} className="space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role {index + 1}
                  </span>
                  {state.experience.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          'experience',
                          state.experience.filter((entry) => entry.id !== item.id),
                        )
                      }
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Job title" htmlFor={`role-${item.id}`}>
                    <input
                      id={`role-${item.id}`}
                      value={item.role}
                      onChange={(event) =>
                        set(
                          'experience',
                          state.experience.map((entry) =>
                            entry.id === item.id ? { ...entry, role: event.target.value } : entry,
                          ),
                        )
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Employer" htmlFor={`company-${item.id}`}>
                    <input
                      id={`company-${item.id}`}
                      value={item.company}
                      onChange={(event) =>
                        set(
                          'experience',
                          state.experience.map((entry) =>
                            entry.id === item.id ? { ...entry, company: event.target.value } : entry,
                          ),
                        )
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Dates" htmlFor={`dates-${item.id}`} hint="e.g. Mar 2022 – Jun 2024">
                  <input
                    id={`dates-${item.id}`}
                    value={item.dates}
                    onChange={(event) =>
                      set(
                        'experience',
                        state.experience.map((entry) =>
                          entry.id === item.id ? { ...entry, dates: event.target.value } : entry,
                        ),
                      )
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="What you achieved" htmlFor={`bullets-${item.id}`}>
                  <textarea
                    id={`bullets-${item.id}`}
                    rows={4}
                    value={item.bullets}
                    onChange={(event) =>
                      set(
                        'experience',
                        state.experience.map((entry) =>
                          entry.id === item.id ? { ...entry, bullets: event.target.value } : entry,
                        ),
                      )
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              set('experience', [
                ...state.experience,
                { id: newId('exp', state.experience), role: '', company: '', dates: '', bullets: '' },
              ])
            }
            className={`${buttonClass({ variant: 'outline', size: 'sm' })} mt-4`}
          >
            Add another role
          </button>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 dark:text-white">Education</h2>
          <div className="mt-4 space-y-4">
            {state.education.map((item, index) => (
              <div key={item.id} className="grid gap-3 sm:grid-cols-3">
                <Field label={`Qualification ${index + 1}`} htmlFor={`qual-${item.id}`}>
                  <input
                    id={`qual-${item.id}`}
                    value={item.qualification}
                    onChange={(event) =>
                      set(
                        'education',
                        state.education.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, qualification: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Institution" htmlFor={`inst-${item.id}`}>
                  <input
                    id={`inst-${item.id}`}
                    value={item.institution}
                    onChange={(event) =>
                      set(
                        'education',
                        state.education.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, institution: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Year" htmlFor={`year-${item.id}`}>
                  <input
                    id={`year-${item.id}`}
                    value={item.year}
                    onChange={(event) =>
                      set(
                        'education',
                        state.education.map((entry) =>
                          entry.id === item.id ? { ...entry, year: event.target.value } : entry,
                        ),
                      )
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              set('education', [
                ...state.education,
                { id: newId('edu', state.education), qualification: '', institution: '', year: '' },
              ])
            }
            className={`${buttonClass({ variant: 'outline', size: 'sm' })} mt-4`}
          >
            Add qualification
          </button>
        </Card>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className={buttonClass()}>
            Download as PDF
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('Clear the whole CV and start again?')) setState(emptyState)
            }}
            className={buttonClass({ variant: 'outline' })}
          >
            Start again
          </button>
        </div>
      </div>

      {/* Preview ------------------------------------------------------- */}
      <div className="mt-8 lg:mt-0">
        <p className="mb-2 text-sm font-medium text-slate-600 print:hidden dark:text-slate-400">
          Live preview — this is what prints.
        </p>
        <div
          id="resume-preview"
          className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none dark:border-slate-800"
        >
          <header className="border-b border-slate-300 pb-3">
            <h1 className="text-2xl font-bold">{state.name || 'Your name'}</h1>
            {state.headline ? <p className="mt-0.5 text-sm">{state.headline}</p> : null}
            <p className="mt-1 text-xs text-slate-600">
              {[state.location, state.phone, state.email, state.link].filter(Boolean).join(' · ') ||
                'City · Phone · Email · Link'}
            </p>
          </header>

          {state.summary ? (
            <section className="mt-4">
              <h2 className="text-sm font-bold uppercase tracking-wide">Summary</h2>
              <p className="mt-1 text-sm leading-relaxed">{state.summary}</p>
            </section>
          ) : null}

          <section className="mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Experience</h2>
            {state.experience.map((item) => (
              <div key={item.id} className="mt-3">
                <p className="text-sm font-semibold">
                  {item.role || 'Job title'}
                  {item.company ? `, ${item.company}` : ''}
                </p>
                {item.dates ? <p className="text-xs text-slate-600">{item.dates}</p> : null}
                <ul className="mt-1 list-disc pl-5 text-sm leading-relaxed">
                  {item.bullets
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </div>
            ))}
          </section>

          {skills.length ? (
            <section className="mt-4">
              <h2 className="text-sm font-bold uppercase tracking-wide">Skills</h2>
              <p className="mt-1 text-sm">{skills.join(' · ')}</p>
            </section>
          ) : null}

          <section className="mt-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Education</h2>
            {state.education.map((item) => (
              <p key={item.id} className="mt-1 text-sm">
                {[item.qualification, item.institution, item.year].filter(Boolean).join(', ') ||
                  'Qualification, institution, year'}
              </p>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

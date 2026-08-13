'use client'

import { useMemo, useState } from 'react'

import { Card, Field, inputClass } from '@/components/ui'

/**
 * Job match score.
 *
 * Compares the skills a candidate lists against the terms that appear in a job
 * advert. Deliberately transparent rather than clever: it shows exactly which
 * words matched, so the score is auditable and the candidate learns something
 * they can act on. Runs entirely in the browser.
 */

// Words too common in job adverts to carry signal.
const stopWords = new Set([
  'and', 'the', 'for', 'with', 'you', 'our', 'are', 'will', 'have', 'this', 'that', 'from', 'your',
  'work', 'role', 'team', 'job', 'about', 'who', 'what', 'they', 'them', 'their', 'been', 'more',
  'other', 'must', 'able', 'good', 'strong', 'excellent', 'experience', 'skills', 'years', 'year',
  'within', 'across', 'including', 'ability', 'looking', 'candidate', 'applicants', 'please',
])

function tokenise(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .map((word) => word.replace(/\.$/, ''))
      .filter((word) => word.length > 2 && !stopWords.has(word)),
  )
}

export function JobMatch() {
  const [advert, setAdvert] = useState('')
  const [skills, setSkills] = useState('')

  const result = useMemo(() => {
    const mySkills = skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

    if (!advert.trim() || mySkills.length === 0) return null

    const advertTokens = tokenise(advert)
    const matched: string[] = []
    const missing: string[] = []

    for (const skill of mySkills) {
      const parts = skill.toLowerCase().split(/\s+/)
      const hit = parts.every((part) => advertTokens.has(part.replace(/\.$/, '')))
      if (hit) matched.push(skill)
      else missing.push(skill)
    }

    // Requirement lines the advert emphasises that you did not claim.
    const skillTokens = tokenise(mySkills.join(' '))
    const gaps = [...advertTokens]
      .filter((token) => !skillTokens.has(token))
      .filter((token) => /^[a-z][a-z+#.]{3,}$/.test(token))
      .slice(0, 12)

    const score = Math.round((matched.length / mySkills.length) * 100)

    return { matched, missing, gaps, score }
  }, [advert, skills])

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
      <Card className="space-y-4">
        <Field
          label="Paste the job advert"
          htmlFor="jm-advert"
          hint="The requirements and responsibilities sections are the useful part."
        >
          <textarea
            id="jm-advert"
            rows={12}
            value={advert}
            onChange={(event) => setAdvert(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="Your skills"
          htmlFor="jm-skills"
          hint="Comma separated. Only list what you could defend in an interview."
        >
          <input
            id="jm-skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="e.g. SQL, Excel, stakeholder management"
            className={inputClass}
          />
        </Field>
      </Card>

      <div className="mt-8 lg:mt-0">
        {result ? (
          <div className="space-y-5">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Skill match</p>
              <p className="mt-1 text-5xl font-bold text-slate-900 dark:text-white">
                {result.score}%
              </p>
              <div
                className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                role="progressbar"
                aria-valuenow={result.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Skill match score"
              >
                <div
                  className={`h-full rounded-full ${result.score >= 60 ? 'bg-emerald-500' : result.score >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {result.score >= 60
                  ? 'Strong match. Lead with the matched skills in the top third of your CV and name two of them in your cover letter.'
                  : result.score >= 30
                    ? 'Worth applying. Most candidates match around 60% of a job advert, and employers know it. Emphasise what you do match and address one gap honestly.'
                    : 'This advert asks for a different profile. Either your skills list is written in different vocabulary from the advert, or the role is a stretch. Check the wording first.'}
              </p>
            </Card>

            {result.matched.length ? (
              <Card>
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Matched ({result.matched.length})
                </h3>
                <p className="mt-1 text-xs text-slate-500">Put these at the top of your CV.</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {result.matched.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-md bg-emerald-50 px-2 py-1 text-sm text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {result.missing.length ? (
              <Card>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  Not mentioned in this advert
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Still true of you, but not what this employer asked for. Move them further down.
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {result.missing.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {result.gaps.length ? (
              <Card>
                <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                  Terms in the advert you did not claim
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  If any of these are true of you, add them — using the advert&apos;s wording.
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {result.gaps.map((token) => (
                    <li
                      key={token}
                      className="rounded-md bg-amber-50 px-2 py-1 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                    >
                      {token}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
            Paste a job advert and list your skills to see the match.
          </div>
        )}
      </div>
    </div>
  )
}

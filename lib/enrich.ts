import { findSkill, type SkillEntry } from '@/content/skills'
import {
  csv,
  employmentLabels,
  experienceLabels,
  formatSalary,
  lines,
  workModeLabels,
} from '@/lib/utils'

/**
 * Builds the original, page-specific guidance that sits around a job listing.
 *
 * Two rules govern this module:
 *  - Editorial fields stored on the job (written by our team) always win.
 *  - Anything generated here is derived from the job's own attributes so two
 *    different jobs never produce the same page. Nothing is copied from the
 *    employer's description.
 */

export type JobLike = {
  title: string
  city: string
  country: string
  workMode: string
  employment: string
  experience: string
  education?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryPeriod: string
  currency: string
  skills: string
  requirements: string
  responsibilities: string
  certifications?: string | null
  editorialSummary?: string | null
  careerPath?: string | null
  interviewPrep?: string | null
  salaryInsight?: string | null
  industryOverview?: string | null
  source: string
  sourceName?: string | null
  company: { name: string; industry: string; description: string; size?: string | null }
}

export type EnrichedJob = {
  summary: string
  skillGuides: SkillEntry[]
  otherSkills: string[]
  careerPath: string[]
  resumeAdvice: string[]
  coverLetterTips: string[]
  interviewPrep: string[]
  salaryInsight: string
  industryOverview: string
  certifications: string[]
  applicationChecklist: string[]
}

function location(job: JobLike): string {
  return job.workMode === 'REMOTE' ? `remote (${job.country})` : `${job.city}, ${job.country}`
}

function summarise(job: JobLike): string {
  if (job.editorialSummary) return job.editorialSummary

  const mode = (workModeLabels[job.workMode] ?? job.workMode).toLowerCase()
  const type = (employmentLabels[job.employment] ?? job.employment).toLowerCase()
  const level = (experienceLabels[job.experience] ?? job.experience).toLowerCase()
  const topSkills = csv(job.skills).slice(0, 3)
  const responsibilityCount = lines(job.responsibilities).length

  const skillPhrase =
    topSkills.length > 1
      ? `${topSkills.slice(0, -1).join(', ')} and ${topSkills[topSkills.length - 1]}`
      : (topSkills[0] ?? 'the core skills listed below')

  return [
    `${job.company.name} is hiring a ${job.title} on a ${type} basis in ${location(job)}.`,
    `The role is ${mode} and pitched at ${level}, so the hiring team will expect working familiarity with ${skillPhrase} rather than classroom exposure.`,
    responsibilityCount
      ? `There are ${responsibilityCount} core responsibilities attached to the position; the first two are usually what the interview actually focuses on.`
      : 'The responsibilities below are the ones worth rehearsing before an interview.',
    `${job.company.name} operates in ${job.company.industry.toLowerCase()}, which shapes both the pace of the work and the kind of examples that land well in an interview.`,
  ].join(' ')
}

function buildCareerPath(job: JobLike): string[] {
  const stored = lines(job.careerPath)
  if (stored.length) return stored

  const base = job.title.replace(/^(senior|junior|lead|principal|graduate)\s+/i, '').trim()
  const ladders: Record<string, string[]> = {
    ENTRY: [
      `Junior ${base} — first 12 to 18 months, focused on delivery with supervision`,
      `${base} — owning work end to end`,
      `Senior ${base} — setting standards and mentoring`,
    ],
    JUNIOR: [
      `${base} — the next step, typically 12 to 24 months away`,
      `Senior ${base} — technical ownership of a domain`,
      `Lead ${base} or specialist track`,
    ],
    MID: [
      `Senior ${base} — depth in one area plus reliable delivery`,
      `Lead ${base} or ${base} Manager — the branch point between people and craft`,
      `Head of ${job.company.industry} function — three to six years out`,
    ],
    SENIOR: [
      `Lead ${base} — technical direction across several teams`,
      `${base} Manager — if you would rather grow people than systems`,
      `Principal or Head of function`,
    ],
    LEAD: [
      `Principal ${base} — organisation-wide technical influence`,
      `Head of Department`,
      `Director or VP level leadership`,
    ],
  }
  return ladders[job.experience] ?? ladders.MID!
}

function buildResumeAdvice(job: JobLike): string[] {
  const skills = csv(job.skills).slice(0, 4)
  const firstResponsibility = lines(job.responsibilities)[0]
  const advice = [
    `Put ${skills.slice(0, 3).join(', ') || 'the listed skills'} in the top third of page one. Most screens for a ${job.title} take under a minute, and recruiters read top-down.`,
    `Mirror the language of the listing where it is honest to do so. If the advert says "${skills[0] ?? job.title}", write "${skills[0] ?? job.title}" — not a synonym an applicant tracking system will miss.`,
    'Lead each bullet with a verb and close it with a number. "Managed reporting" is invisible; "Rebuilt weekly reporting for 12 branches, cutting prep time from 6 hours to 40 minutes" is not.',
  ]
  if (firstResponsibility) {
    advice.push(
      `The listing puts "${firstResponsibility.replace(/\.$/, '')}" first, which usually signals the day-one priority. Make sure one bullet on your CV maps directly to it.`,
    )
  }
  if (job.workMode === 'REMOTE') {
    advice.push(
      'For a remote role, state your time zone and any prior remote experience explicitly. Hiring managers filter on it and will not guess.',
    )
  }
  advice.push(
    `Keep it to ${job.experience === 'ENTRY' || job.experience === 'JUNIOR' ? 'one page' : 'two pages'} and export as PDF so your layout survives.`,
  )
  return advice
}

function buildCoverLetterTips(job: JobLike): string[] {
  return [
    `Open with the specific role and where you saw it: "I am applying for the ${job.title} role at ${job.company.name}." No suspense, no throat-clearing.`,
    `Paragraph two is the one that matters. Take a single requirement from the listing and give a concrete example of doing it, with the outcome.`,
    `Show that you know something about ${job.company.name} beyond its homepage — a product decision, a market they operate in, a recent change in ${job.company.industry.toLowerCase()}.`,
    'Close with availability and a clear next step. Three to four short paragraphs, under 300 words, in the body of the email if you are applying by email.',
    'Never send the same letter twice. Reviewers can tell, and a generic letter is worse than none.',
  ]
}

function buildInterviewPrep(job: JobLike): string[] {
  const stored = lines(job.interviewPrep)
  if (stored.length) return stored

  const skills = csv(job.skills)
  const prep = [
    `Prepare a two-minute answer to "why this role at ${job.company.name}?" that references the company's work in ${job.company.industry.toLowerCase()}.`,
    `Have three STAR stories ready — situation, task, action, result — that cover ${skills.slice(0, 2).join(' and ') || 'your core skills'}.`,
  ]
  if (skills[0]) {
    const guide = findSkill(skills[0])
    if (guide) prep.push(`On ${guide.label}: ${guide.howItIsAssessed}`)
  }
  prep.push(
    `Expect at least one question about working ${(workModeLabels[job.workMode] ?? '').toLowerCase()}, especially how you keep work visible to people who cannot see your screen.`,
    `Prepare two questions of your own. Good ones: what does success look like in the first 90 days, and what does the team find hardest right now?`,
  )
  if (job.experience === 'SENIOR' || job.experience === 'LEAD') {
    prep.push(
      'At this level, expect a scope question: a decision you made with incomplete information, and how you would make it differently now.',
    )
  }
  return prep
}

function buildSalaryInsight(job: JobLike): string {
  if (job.salaryInsight) return job.salaryInsight

  const range = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod)
  const level = (experienceLabels[job.experience] ?? job.experience).toLowerCase()

  if (!range) {
    return [
      `${job.company.name} has not published a salary for this ${job.title} role.`,
      `That is common, and it is not a red flag by itself. Ask for the band at the first screening call — most recruiters will share it, and it saves both sides time.`,
      `Before that call, decide on your own number for a ${level} role in ${location(job)}. Our salary guides give a starting point, and it is far easier to negotiate from a figure you have already justified to yourself.`,
    ].join(' ')
  }

  return [
    `This role advertises ${range}.`,
    `For a ${level} position in ${location(job)}, treat the top of the band as achievable only if you match nearly every requirement listed.`,
    `If you are asked for expectations first, give a range whose bottom you would genuinely accept, and confirm what sits alongside base pay — bonus, pension, leave, and any allowance for ${job.workMode === 'REMOTE' ? 'home office equipment' : 'commuting'}.`,
  ].join(' ')
}

function buildIndustryOverview(job: JobLike): string {
  if (job.industryOverview) return job.industryOverview
  const size = job.company.size ? `a ${job.company.size} organisation` : 'the organisation'
  return [
    `${job.company.name} works in ${job.company.industry}.`,
    `As ${size}, that affects how the ${job.title} role is scoped: smaller teams tend to want breadth and a bias to action, larger ones want depth and evidence that you can work across functions.`,
    `Candidates who research the sector — its customers, its regulation, its current pressures — interview noticeably better than those who research only the company.`,
  ].join(' ')
}

function buildCertifications(job: JobLike): string[] {
  const stored = lines(job.certifications)
  if (stored.length) return stored
  const requirementHints = lines(job.requirements).filter((line) =>
    /certif|licen[cs]e|accredit|chartered|registered/i.test(line),
  )
  return requirementHints
}

function buildChecklist(job: JobLike): string[] {
  const items = [
    'A CV tailored to this listing, saved as PDF with your name in the filename.',
    'A short cover note that names the role and one relevant result.',
  ]
  if (job.education) items.push('Proof of the stated qualification, ready to send if requested.')
  items.push(
    'Two referees who have agreed in advance to be contacted.',
    job.source === 'DIRECT'
      ? 'Ten minutes to complete the application form on this page.'
      : `An account on ${job.sourceName ?? 'the partner site'} — the employer takes applications there.`,
  )
  return items
}

export function enrichJob(job: JobLike): EnrichedJob {
  const skillNames = csv(job.skills)
  const guides: SkillEntry[] = []
  const seen = new Set<string>()
  const other: string[] = []

  for (const name of skillNames) {
    const guide = findSkill(name)
    if (guide && !seen.has(guide.key)) {
      seen.add(guide.key)
      guides.push(guide)
    } else if (!guide) {
      other.push(name)
    }
  }

  return {
    summary: summarise(job),
    skillGuides: guides.slice(0, 5),
    otherSkills: other,
    careerPath: buildCareerPath(job),
    resumeAdvice: buildResumeAdvice(job),
    coverLetterTips: buildCoverLetterTips(job),
    interviewPrep: buildInterviewPrep(job),
    salaryInsight: buildSalaryInsight(job),
    industryOverview: buildIndustryOverview(job),
    certifications: buildCertifications(job),
    applicationChecklist: buildChecklist(job),
  }
}

/** Default FAQs used when an employer has not supplied their own. */
export function defaultFaqs(job: JobLike): { question: string; answer: string }[] {
  const range = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod)
  const faqs = [
    {
      question: `Is the ${job.title} role at ${job.company.name} remote?`,
      answer:
        job.workMode === 'REMOTE'
          ? `Yes. This position is advertised as remote. Confirm the accepted time zones and whether the company can employ in your country before you apply.`
          : job.workMode === 'HYBRID'
            ? `Partly. It is a hybrid role based in ${job.city}, ${job.country}, so expect a mix of office and home days. Ask how many days on site are expected each week.`
            : `No. It is an on-site role in ${job.city}, ${job.country}.`,
    },
    {
      question: 'What salary does this role pay?',
      answer: range
        ? `The advertised range is ${range}. Total package may also include bonus, pension and leave, so ask for the full breakdown at screening stage.`
        : 'No salary has been published for this listing. Ask the recruiter for the band during the first call — it is a reasonable question and most will answer it.',
    },
    {
      question: 'How do I apply?',
      answer:
        job.source === 'DIRECT'
          ? 'Use the application form on this page. You will need your CV and about ten minutes.'
          : `This listing is hosted on ${job.sourceName ?? 'a partner job board'}. The Apply button sends you to the employer's own application page there. You can also save the job here and track it from your dashboard.`,
    },
    {
      question: 'How long does a response usually take?',
      answer:
        'Two to three weeks is typical. If you have heard nothing after ten working days, a short, polite follow-up to the recruiter is appropriate and will not count against you.',
    },
    {
      question: `What experience level is required?`,
      answer: `${experienceLabels[job.experience] ?? job.experience}. If you meet roughly 70% of the requirements it is still worth applying — very few candidates match every line of a job advert.`,
    },
  ]
  return faqs
}

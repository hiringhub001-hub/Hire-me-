import { csv, employmentLabels, experienceLabels, formatSalary, workModeLabels } from '@/lib/utils'

/**
 * Builds the original analysis that sits on a company profile.
 *
 * Company pages were the weakest thing on the site: a heading, a location and a
 * list of adverts, all ending in the same sentence about the profile not having
 * been expanded yet. Thirty-eight near-identical stubs is exactly what Google
 * means by low value content, and it is no use to a job seeker either.
 *
 * The same two rules as lib/enrich.ts apply here:
 *  - Anything the employer or our team has actually written wins.
 *  - Everything else is derived from the company's own live listings, so two
 *    companies with different hiring produce different pages. Nothing is copied
 *    from the employer, and nothing is invented: where the listings do not
 *    support a claim, the text says so rather than filling the gap.
 */

export type InsightJob = {
  title: string
  city: string
  country: string
  workMode: string
  employment: string
  experience: string
  salaryMin?: number | null
  salaryMax?: number | null
  salaryPeriod?: string | null
  currency: string
  skills?: string | null
  source: string
  sourceName?: string | null
  allowInternal: boolean
  postedAt: Date
  category?: { name: string } | null
}

export type InsightCompany = {
  name: string
  industry: string
  size?: string | null
  headquarters?: string | null
}

export type CompanyInsight = {
  /** One paragraph good enough to serve as the meta description. */
  summary: string
  hiring: string
  locations: string
  pay: string
  skills: { label: string; count: number }[]
  skillsNote: string
  applying: string
  /** Enough substance to deserve indexing. */
  substantial: boolean
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

/** "London, United Kingdom", or just the country for a remote listing. */
function place(job: InsightJob): string {
  return job.workMode === 'REMOTE' ? `Remote, ${job.country}` : `${job.city}, ${job.country}`
}

function commaList(items: string[], joiner = 'and'): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} ${joiner} ${items[1]}`
  return `${items.slice(0, -1).join(', ')} ${joiner} ${items[items.length - 1]}`
}

/** Most frequent values first, ties broken by first appearance. */
function tally<T>(items: T[]): Map<T, number> {
  const counts = new Map<T, number>()
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1)
  return new Map([...counts.entries()].sort((a, b) => b[1] - a[1]))
}

function buildHiring(company: InsightCompany, jobs: InsightJob[]): string {
  if (jobs.length === 0) {
    return `${company.name} has no live roles on ${'CareerHub'} right now. Company profiles stay up between campaigns, so it is worth checking back or setting an alert rather than assuming they have stopped hiring.`
  }

  const categories = [...tally(jobs.map((job) => job.category?.name).filter(Boolean) as string[])]
  const levels = [...tally(jobs.map((job) => experienceLabels[job.experience] ?? job.experience))]
  const types = [...tally(jobs.map((job) => employmentLabels[job.employment] ?? job.employment))]

  const parts: string[] = []

  parts.push(
    categories.length === 1
      ? `All ${plural(jobs.length, 'open role')} at ${company.name} sit in ${categories[0]![0].toLowerCase()}.`
      : categories.length > 1
        ? `${company.name} is advertising ${plural(jobs.length, 'role')} across ${commaList(categories.slice(0, 3).map(([name]) => name.toLowerCase()))}.`
        : `${company.name} is advertising ${plural(jobs.length, 'role')}.`,
  )

  if (levels.length === 1) {
    parts.push(
      `Every one is pitched at ${levels[0]![0].toLowerCase()} level, so this is not an employer to approach speculatively at a different stage of your career — wait for a listing that matches.`,
    )
  } else {
    parts.push(
      `The listings span ${commaList(levels.map(([name]) => name.toLowerCase()))} level, which usually means a team being built out rather than a single vacancy being backfilled.`,
    )
  }

  if (types.length === 1 && types[0]![0] !== 'Full-time') {
    parts.push(
      `All of them are ${types[0]![0].toLowerCase()}, so check the contract terms carefully before you apply.`,
    )
  } else if (types.length > 1) {
    parts.push(`Contract types vary — ${commaList(types.map(([name]) => `${name.toLowerCase()} (${tally(jobs.map((j) => employmentLabels[j.employment] ?? j.employment)).get(name) ?? 0})`))}.`)
  }

  return parts.join(' ')
}

function buildLocations(company: InsightCompany, jobs: InsightJob[]): string {
  if (jobs.length === 0) {
    return company.headquarters
      ? `${company.name} is based in ${company.headquarters}.`
      : `${company.name} has not published a head office location.`
  }

  const modes = tally(jobs.map((job) => workModeLabels[job.workMode] ?? job.workMode))
  const places = tally(jobs.map((job) => place(job)))
  const remote = jobs.filter((job) => job.workMode === 'REMOTE').length
  const parts: string[] = []

  parts.push(
    places.size === 1
      ? `Hiring is concentrated in one place: ${[...places.keys()][0]}.`
      : `Roles are spread across ${plural(places.size, 'location')} — ${commaList([...places.keys()].slice(0, 4))}.`,
  )

  if (remote === jobs.length) {
    parts.push(
      `Every role is remote, so your location matters less than your right to work in the country the contract is issued from. Confirm that early.`,
    )
  } else if (remote > 0) {
    parts.push(
      `${remote} of ${jobs.length} can be done remotely; the rest expect you on site or hybrid, so check each listing rather than assuming the pattern holds.`,
    )
  } else {
    parts.push(
      `None of the current roles are advertised as remote — ${commaList([...modes.keys()].map((m) => m.toLowerCase()))} only. If you need flexibility, raise it at the first call rather than after an offer.`,
    )
  }

  if (company.headquarters && !places.has(company.headquarters)) {
    parts.push(`The head office is in ${company.headquarters}, which is not where the current vacancies sit.`)
  }

  return parts.join(' ')
}

function buildPay(company: InsightCompany, jobs: InsightJob[]): string {
  const withPay = jobs.filter((job) => job.salaryMin || job.salaryMax)

  if (jobs.length === 0) {
    return `There are no live listings to draw pay information from.`
  }

  if (withPay.length === 0) {
    return [
      `None of ${company.name}'s ${plural(jobs.length, 'current listing')} state a salary.`,
      `That is common and not a red flag on its own, but it does put the burden on you: decide your number before the first call, and ask for their band at the end of that call rather than naming yours first.`,
    ].join(' ')
  }

  const ranges = withPay
    .map((job) => formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod ?? undefined))
    .filter(Boolean) as string[]

  const parts = [
    withPay.length === jobs.length
      ? `Every listing states a salary, which is worth noting — most employers still do not.`
      : `${withPay.length} of ${jobs.length} listings state a salary.`,
    `Published ranges: ${commaList([...new Set(ranges)])}.`,
    `Treat the top of any band as reachable only if you meet nearly every requirement in the advert. For the roles with no figure, ask early.`,
  ]

  return parts.join(' ')
}

function buildSkills(jobs: InsightJob[]): { label: string; count: number }[] {
  const all = jobs.flatMap((job) => csv(job.skills))
  const counts = tally(all.map((skill) => skill.trim()).filter(Boolean))
  return [...counts.entries()]
    .filter(([, count]) => count > 0)
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }))
}

function buildSkillsNote(company: InsightCompany, jobs: InsightJob[], top: { label: string; count: number }[]): string {
  if (top.length === 0) {
    return `${company.name}'s listings do not break out a skills list, so read each advert's requirements in full before applying.`
  }
  const repeated = top.filter((skill) => skill.count > 1)
  if (repeated.length === 0) {
    return `No single skill repeats across ${company.name}'s ${plural(jobs.length, 'listing')} — each role asks for something different, so tailor your CV to the specific advert rather than to the company.`
  }
  return `${commaList(repeated.slice(0, 3).map((skill) => skill.label))} ${repeated.length === 1 ? 'appears' : 'appear'} in more than one listing, which is the clearest signal of what this employer actually values. Lead with ${repeated[0]!.label} on your CV if you have it.`
}

function buildApplying(company: InsightCompany, jobs: InsightJob[]): string {
  if (jobs.length === 0) return `There is nothing to apply to at the moment.`

  const easy = jobs.filter((job) => job.allowInternal && job.source === 'DIRECT').length
  const external = jobs.length - easy
  const boards = [...new Set(jobs.map((job) => job.sourceName).filter(Boolean))] as string[]

  if (easy === jobs.length) {
    return `All ${plural(jobs.length, 'role')} accept applications here: upload a CV once and apply without creating another account. ${company.name} receives your application by email the moment you submit it.`
  }
  if (easy === 0) {
    return `${company.name} takes applications on ${boards.length ? commaList(boards) : 'their own site'} rather than here, so you will need an account there. Read the listing on this page first — it is more complete than the summary most boards show — then follow the apply link.`
  }
  return `${easy} of ${jobs.length} roles can be applied to directly on this site; the other ${external} send you to ${boards.length ? commaList(boards) : 'the employer'}. The apply button on each listing tells you which before you click.`
}

function buildSummary(company: InsightCompany, jobs: InsightJob[]): string {
  const size = company.size ? `, a ${company.size} employer,` : ''
  if (jobs.length === 0) {
    return `${company.name}${size} works in ${company.industry}. There are no live vacancies on this profile right now.`
  }
  const places = tally(jobs.map((job) => place(job)))
  return `${company.name}${size} works in ${company.industry} and is currently advertising ${plural(jobs.length, 'role')} in ${commaList([...places.keys()].slice(0, 3))}. Below: what they are hiring for, where the roles sit, what the listings say about pay, and how applications are handled.`
}

/**
 * A profile earns indexing by having something to say.
 *
 * One advert and a generated blurb is a stub, and publishing thousands of those
 * is what gets a site classed as thin. Those pages still work for anyone who
 * follows a link to them — they are simply kept out of the sitemap and marked
 * noindex until the employer or their hiring gives us more to write about.
 */
/**
 * The employer's own words, or nothing.
 *
 * Every profile created from a job posting was given the same generated
 * sentence saying the profile had not been expanded yet. It is not a
 * description, and it should never reach a reader, a search result or a
 * structured-data block — so it is filtered here, once, rather than at each of
 * the four places that render a description.
 */
export function writtenDescription(description: string | null | undefined): string {
  const text = (description ?? '').trim()
  return /has not yet been expanded/i.test(text) ? '' : text
}

export function isSubstantial(description: string | null, liveJobCount: number): boolean {
  const written = (description ?? '').trim()
  const isStub = /has not yet been expanded/i.test(written) || written.length < 220
  // Either a genuine written overview, or enough live hiring to analyse.
  return !isStub || liveJobCount >= 3
}

export function buildCompanyInsight(
  company: InsightCompany,
  jobs: InsightJob[],
  description: string,
): CompanyInsight {
  const skills = buildSkills(jobs)
  return {
    summary: buildSummary(company, jobs),
    hiring: buildHiring(company, jobs),
    locations: buildLocations(company, jobs),
    pay: buildPay(company, jobs),
    skills,
    skillsNote: buildSkillsNote(company, jobs, skills),
    applying: buildApplying(company, jobs),
    substantial: isSubstantial(description, jobs.length),
  }
}

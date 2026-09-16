import { csv, employmentLabels, experienceLabels, formatSalary, workModeLabels } from '@/lib/utils'

/**
 * Shared analysis of a set of live job adverts.
 *
 * Category and location landing pages carried two paragraphs and a grid of
 * cards — around 350 words, most of it the same on every page. They rank for
 * real queries ("technology jobs", "jobs in Nigeria"), so somebody arriving on
 * one deserves to learn something about the market they just searched for.
 *
 * Everything below is counted from the adverts actually on the page. Where the
 * listings do not support a statement it is left out rather than padded, so a
 * page covering three roles stays shorter than one covering forty.
 */

export type SnapshotJob = {
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
  company: { name: string }
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

export function commaList(items: string[], joiner = 'and'): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} ${joiner} ${items[1]}`
  return `${items.slice(0, -1).join(', ')} ${joiner} ${items[items.length - 1]}`
}

/** Most frequent first. */
export function tally<T>(items: T[]): Map<T, number> {
  const counts = new Map<T, number>()
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1)
  return new Map([...counts.entries()].sort((a, b) => b[1] - a[1]))
}

export function placeOf(job: { workMode: string; city: string; country: string }): string {
  return job.workMode === 'REMOTE' ? `Remote, ${job.country}` : `${job.city}, ${job.country}`
}

/**
 * Paragraphs describing what is currently advertised.
 *
 * @param label how to refer to the set in prose, e.g. "technology" or "Nigeria"
 */
export function buildListingSnapshot(jobs: SnapshotJob[], label: string): string[] {
  if (jobs.length === 0) return []

  const out: string[] = []

  const employers = tally(jobs.map((job) => job.company.name))
  const places = tally(jobs.map((job) => placeOf(job)))
  const modes = tally(jobs.map((job) => workModeLabels[job.workMode] ?? job.workMode))
  const levels = tally(jobs.map((job) => experienceLabels[job.experience] ?? job.experience))
  const types = tally(jobs.map((job) => employmentLabels[job.employment] ?? job.employment))

  out.push(
    `Right now there ${jobs.length === 1 ? 'is' : 'are'} ${plural(jobs.length, 'live ' + label + ' role')} on the site from ${plural(employers.size, 'employer')}, advertised in ${commaList([...places.keys()].slice(0, 4))}${places.size > 4 ? ` and ${places.size - 4} other places` : ''}.` +
      (employers.size < jobs.length
        ? ` ${[...employers.keys()][0]} accounts for ${employers.get([...employers.keys()][0]!)} of them, so read those listings together — the same employer tends to run the same process.`
        : ` No employer is advertising more than one, which usually means genuine separate vacancies rather than one team hiring at scale.`),
  )

  const remote = jobs.filter((job) => job.workMode === 'REMOTE').length
  out.push(
    remote === 0
      ? `None of the current ${label} roles are remote — ${commaList([...modes.keys()].map((m) => m.toLowerCase()))} only. If you need to work from home, say so at the first call rather than after an offer, because it is far harder to renegotiate later.`
      : remote === jobs.length
        ? `Every one of these roles is remote. That widens your options, but check which country each contract is issued from: your right to work there, and the tax position, matter more than where you happen to sit.`
        : `${remote} of the ${jobs.length} can be done remotely and the rest are ${commaList([...modes.keys()].filter((m) => m !== 'Remote').map((m) => m.toLowerCase()))}, so filter before you start writing applications.`,
  )

  out.push(
    levels.size === 1
      ? `All of them are pitched at ${[...levels.keys()][0]!.toLowerCase()} level.`
      : `Experience levels run from ${commaList([...levels.keys()].map((l) => l.toLowerCase()))}. Applying a level above where you sit is usually wasted effort unless the advert says the range is flexible.`,
  )

  const withPay = jobs.filter((job) => job.salaryMin || job.salaryMax)
  const ranges = [
    ...new Set(
      withPay
        .map((job) => formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryPeriod ?? undefined))
        .filter(Boolean) as string[],
    ),
  ]
  out.push(
    withPay.length === 0
      ? `None of these listings publish a salary. That is normal rather than suspicious, but it does mean deciding your own number before the first call and asking for their band at the end of it.`
      : `${withPay.length} of ${jobs.length} publish a salary — ${commaList(ranges.slice(0, 4))}. Treat the top of any band as reachable only if you meet nearly every requirement in the advert.`,
  )

  const skills = tally(jobs.flatMap((job) => csv(job.skills)).map((s) => s.trim()).filter(Boolean))
  const repeated = [...skills.entries()].filter(([, n]) => n > 1).slice(0, 5)
  if (repeated.length) {
    out.push(
      `The skills asked for most across these adverts are ${commaList(repeated.map(([name, n]) => `${name} (${n} listings)`))}. If you have them, put them where a screener will see them in the first few seconds rather than in a list at the bottom of your CV.`,
    )
  }

  if (types.size > 1) {
    out.push(
      `Contract types are mixed: ${commaList([...types.entries()].map(([name, n]) => `${n} ${name.toLowerCase()}`))}. Check notice periods and whether any are fixed term before you commit to a process.`,
    )
  }

  return out
}

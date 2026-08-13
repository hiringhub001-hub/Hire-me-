/**
 * Editorial skill dictionary.
 *
 * Every entry is written in house and explains what the skill actually means
 * on the job, how it is assessed in interviews, and how to evidence it on a
 * CV. Job pages pull from this so a listing page is never a bare reprint of
 * the employer's description.
 */
export type SkillEntry = {
  /** Lowercase match key. */
  key: string
  label: string
  /** What the skill means in day-to-day work. */
  whatItMeans: string
  /** How hiring teams test it. */
  howItIsAssessed: string
  /** Concrete way to show it on a CV. */
  evidenceTip: string
}

export const skillLibrary: SkillEntry[] = [
  {
    key: 'react',
    label: 'React',
    whatItMeans:
      'Building user interfaces out of components, managing state without turning the app into a web of side effects, and knowing when a re-render is costing your users time.',
    howItIsAssessed:
      'Expect a live or take-home exercise: fetch data, render a list, handle loading and error states. Interviewers watch for how you split components and where you put state.',
    evidenceTip:
      'Name the app, the scale, and the outcome: "Rebuilt a 40-screen dashboard in React, cutting first paint from 4.1s to 1.3s."',
  },
  {
    key: 'typescript',
    label: 'TypeScript',
    whatItMeans:
      'Describing the shape of your data so mistakes surface while you type rather than in production. In practice it is mostly about modelling domain types well.',
    howItIsAssessed:
      'Code review conversations: why a union instead of an optional field, how you would type an API response you do not control.',
    evidenceTip:
      'Mention migration work — "Converted a 60k line JavaScript codebase to strict TypeScript" — because that is measurable.',
  },
  {
    key: 'next.js',
    label: 'Next.js',
    whatItMeans:
      'Rendering the right thing in the right place: server components for data, client components for interaction, caching so pages are fast and cheap to serve.',
    howItIsAssessed:
      'Architecture questions about rendering strategies and caching, plus a practical build task.',
    evidenceTip:
      'Talk about Core Web Vitals and traffic. Numbers beat adjectives on a CV every time.',
  },
  {
    key: 'node.js',
    label: 'Node.js',
    whatItMeans:
      'Writing server-side JavaScript that handles concurrent requests without blocking, and understanding the event loop well enough to debug when it does.',
    howItIsAssessed:
      'API design exercises, questions about streams, error handling, and how you would keep a service responsive under load.',
    evidenceTip:
      'Quantify throughput: requests per second handled, latency reduced, or a queue you introduced to smooth spikes.',
  },
  {
    key: 'python',
    label: 'Python',
    whatItMeans:
      'Readable, maintainable code for automation, data work or backend services — and knowing which libraries are worth pulling in.',
    howItIsAssessed:
      'Data manipulation problems, script writing, and questions about testing and packaging.',
    evidenceTip:
      'Link the language to a result: a pipeline you automated, hours of manual work you removed.',
  },
  {
    key: 'sql',
    label: 'SQL',
    whatItMeans:
      'Getting the right rows out of a database efficiently — joins, aggregation, and reading a query plan when something is slow.',
    howItIsAssessed:
      'Almost always a live query exercise. Interviewers care about correctness first, then whether you notice the missing index.',
    evidenceTip:
      'Describe the data volume you worked with. "Queries over a 200M row events table" tells a hiring manager more than "strong SQL".',
  },
  {
    key: 'aws',
    label: 'AWS',
    whatItMeans:
      'Choosing and wiring together managed services, and keeping the bill and the blast radius under control.',
    howItIsAssessed:
      'System design discussions and cost/reliability trade-off questions.',
    evidenceTip:
      'List the specific services and the problem they solved, not a wall of acronyms.',
  },
  {
    key: 'docker',
    label: 'Docker',
    whatItMeans:
      'Packaging an application so it runs the same on your laptop and in production, with images small enough to deploy quickly.',
    howItIsAssessed: 'Practical questions about layers, caching, and multi-stage builds.',
    evidenceTip: 'Mention build time or image size reductions you achieved.',
  },
  {
    key: 'kubernetes',
    label: 'Kubernetes',
    whatItMeans:
      'Running containers reliably at scale: deployments, health checks, resource limits, and rollbacks that work at 3am.',
    howItIsAssessed:
      'Incident scenarios — "a pod is crash-looping, walk me through your first five minutes".',
    evidenceTip: 'Reference cluster size and uptime you were accountable for.',
  },
  {
    key: 'communication',
    label: 'Communication',
    whatItMeans:
      'Explaining a decision to someone who does not share your context, writing updates people actually read, and asking questions early instead of guessing.',
    howItIsAssessed:
      'The whole interview is the assessment. Structure matters more than polish.',
    evidenceTip:
      'Point to artefacts: documentation you own, a proposal you wrote that changed a decision.',
  },
  {
    key: 'project management',
    label: 'Project management',
    whatItMeans:
      'Turning an ambiguous goal into a sequence of deliverables with owners and dates, then keeping the plan honest when reality intervenes.',
    howItIsAssessed:
      'Behavioural questions about a project that slipped and what you did about it.',
    evidenceTip: 'State budget, team size, and delivery date versus plan.',
  },
  {
    key: 'stakeholder management',
    label: 'Stakeholder management',
    whatItMeans:
      'Keeping people with competing priorities aligned and informed without letting the loudest voice set the roadmap.',
    howItIsAssessed: 'Scenario questions about conflicting requests from senior people.',
    evidenceTip: 'Name the seniority of stakeholders and the size of the decision.',
  },
  {
    key: 'excel',
    label: 'Excel',
    whatItMeans:
      'Modelling, cleaning and summarising data quickly — lookups, pivot tables, and building a sheet someone else can maintain.',
    howItIsAssessed: 'A timed modelling test is common in finance and operations roles.',
    evidenceTip: 'Say what the model was used for and who used it.',
  },
  {
    key: 'data analysis',
    label: 'Data analysis',
    whatItMeans:
      'Framing a question, finding the data that answers it, and being clear about how confident the answer is.',
    howItIsAssessed:
      'A case study with a dataset. Interviewers look at the questions you ask before you start.',
    evidenceTip: 'Describe a decision your analysis changed.',
  },
  {
    key: 'figma',
    label: 'Figma',
    whatItMeans:
      'Designing in a shared file: components, variants, and handover that developers can build from without a meeting.',
    howItIsAssessed: 'Portfolio review with a walkthrough of your file structure.',
    evidenceTip: 'Show the design system, not only the finished screens.',
  },
  {
    key: 'seo',
    label: 'SEO',
    whatItMeans:
      'Making pages that answer a real query and are technically easy for search engines to crawl, index and rank.',
    howItIsAssessed: 'A site audit exercise and questions about a traffic drop you diagnosed.',
    evidenceTip: 'Give before/after traffic figures with the time window.',
  },
  {
    key: 'customer service',
    label: 'Customer service',
    whatItMeans:
      'Resolving a problem while leaving the person feeling respected, and spotting the patterns worth escalating.',
    howItIsAssessed: 'Role play with a difficult scenario, plus metrics questions.',
    evidenceTip: 'Quote CSAT, resolution time, or ticket volume handled.',
  },
  {
    key: 'accounting',
    label: 'Accounting',
    whatItMeans:
      'Recording and reconciling transactions accurately, and closing the books on schedule.',
    howItIsAssessed: 'Technical questions on standards plus a reconciliation exercise.',
    evidenceTip: 'Name the standards (IFRS, GAAP) and the close cycle length.',
  },
  {
    key: 'nursing',
    label: 'Nursing',
    whatItMeans:
      'Clinical assessment, safe medication administration, documentation, and clear handover under time pressure.',
    howItIsAssessed:
      'Scenario-based clinical questions and verification of registration.',
    evidenceTip: 'List your registration, specialty, and patient load per shift.',
  },
  {
    key: 'teaching',
    label: 'Teaching',
    whatItMeans:
      'Planning lessons against a curriculum, managing a room, and assessing progress in a way that changes what you teach next.',
    howItIsAssessed: 'A demonstration lesson is standard.',
    evidenceTip: 'Include class sizes, key stages, and outcome improvements.',
  },
]

const bySkillKey = new Map(skillLibrary.map((entry) => [entry.key, entry]))

export function findSkill(name: string): SkillEntry | undefined {
  const key = name.trim().toLowerCase()
  if (bySkillKey.has(key)) return bySkillKey.get(key)
  // Fall back to a loose match so "React.js" resolves to "react".
  return skillLibrary.find(
    (entry) => key.includes(entry.key) || entry.key.includes(key.replace(/\.js$/, '')),
  )
}

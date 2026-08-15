/**
 * Job templates.
 *
 * A recruiter types a job title and gets a complete, editable draft — the way
 * LinkedIn prefills a posting. The point is that nobody should face an empty
 * eight-field form: most small employers abandon there, and the ones who push
 * through write two-line adverts that attract nobody.
 *
 * Every template is written to be usable as-is and obvious to edit. Keep the
 * language plain and the requirements honest — long "essential" lists are the
 * fastest way to deter the candidates you actually want.
 */

export type JobTemplate = {
  /** Canonical label shown in the picker. */
  title: string
  /** Extra words a recruiter might type that should surface this template. */
  aliases: string[]
  categorySlug: string
  employment: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY'
  experience: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD'
  skills: string
  description: string
  responsibilities: string
  requirements: string
  benefits?: string
}

export const jobTemplates: JobTemplate[] = [
  {
    title: 'Web Developer',
    aliases: ['web developer', 'frontend developer', 'front end', 'react developer', 'website'],
    categorySlug: 'technology',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'HTML, CSS, JavaScript, React, Git',
    description:
      'We are looking for a web developer to build and maintain the pages and features our customers use every day. You will work closely with whoever owns the design and the content, and you will own your work from first commit through to it running in production.',
    responsibilities:
      'Build new pages and features, and keep existing ones working\nFix bugs reported by customers and by the team\nMake sure the site works properly on phones as well as desktop\nKeep page load times reasonable as the site grows\nReview your own work before asking someone else to',
    requirements:
      'Practical experience building websites, whether paid, freelance or self-taught\nComfortable with HTML, CSS and JavaScript\nExperience with a modern framework such as React\nAble to use Git without supervision\nWilling to ask questions early rather than get stuck quietly',
    benefits: 'Learning budget\nFlexible working hours',
  },
  {
    title: 'Customer Service Representative',
    aliases: ['customer service', 'customer support', 'call centre', 'call center', 'support agent', 'customer care'],
    categorySlug: 'customer-support',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    skills: 'Customer service, Communication, Problem solving',
    description:
      'We need someone patient and clear-spoken to handle customer questions by phone, email and chat. Most of the job is helping people who are frustrated, so temperament matters more here than experience — we will train you on the product.',
    responsibilities:
      'Answer customer questions by phone, email and chat\nResolve complaints, and escalate the ones you cannot fix yourself\nKeep accurate notes on every conversation\nSpot problems that keep coming back and tell someone who can fix them\nMeet agreed response times',
    requirements:
      'Clear spoken and written communication\nCalm under pressure, and genuinely willing to be told when you got it wrong\nBasic computer skills\nPrevious customer-facing experience is welcome — retail and hospitality count — but not essential',
  },
  {
    title: 'Virtual Assistant',
    aliases: ['virtual assistant', 'va', 'remote assistant', 'personal assistant', 'admin assistant'],
    categorySlug: 'operations',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    skills: 'Organisation, Communication, Email management, Scheduling',
    description:
      'We are looking for a virtual assistant to take the administrative load off the team — inbox, calendar, travel, research and follow-ups. The work is remote, and being reliable about deadlines matters far more than being fast.',
    responsibilities:
      'Manage an inbox and calendar, and protect time for focused work\nSchedule meetings across time zones\nPrepare documents, spreadsheets and simple reports\nChase outstanding items politely and persistently\nHandle travel and expense admin',
    requirements:
      'Strong written English\nOrganised, and able to work without someone checking on you\nComfortable with email, calendars and spreadsheets\nReliable internet connection and a quiet place to work\nDiscretion with confidential information',
  },
  {
    title: 'Nanny',
    aliases: ['nanny', 'childcare', 'babysitter', 'child minder', 'au pair'],
    categorySlug: 'operations',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    skills: 'Childcare, Patience, First aid, Communication',
    description:
      'We are looking for a warm, dependable nanny to care for our children day to day — school runs, meals, play and homework. Trust is the whole job, so we will ask for references and check them.',
    responsibilities:
      'Care for the children safely throughout the day\nPrepare meals and snacks\nSchool drop-off and pick-up\nHelp with homework and organise play and activities\nKeep the children’s areas tidy\nKeep parents updated on how the day went',
    requirements:
      'Previous childcare experience, professional or family\nContactable references\nPatient, calm and genuinely enjoys being around children\nFirst aid certificate, or willing to obtain one\nPunctual and dependable',
  },
  {
    title: 'Sales Representative',
    aliases: ['sales', 'sales rep', 'business development', 'account executive', 'sales executive'],
    categorySlug: 'marketing',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'Sales, Negotiation, Communication, CRM',
    description:
      'We are hiring a sales representative to find new customers and look after existing ones. You will own your pipeline end to end, and you will be measured on revenue rather than on activity.',
    responsibilities:
      'Find and qualify new leads\nRun meetings and demonstrations with prospective customers\nNegotiate and close deals\nKeep the CRM accurate — an out-of-date pipeline helps nobody\nMaintain relationships with existing customers so they renew',
    requirements:
      'Experience selling, in any sector\nComfortable starting conversations with strangers\nAble to handle rejection without losing momentum\nOrganised about follow-ups\nComfortable being measured against a target',
    benefits: 'Commission on top of base salary',
  },
  {
    title: 'Accountant',
    aliases: ['accountant', 'accounting', 'bookkeeper', 'finance officer', 'account officer'],
    categorySlug: 'finance',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'Accounting, Excel, Reconciliation, Attention to detail',
    description:
      'We need an accountant to keep our books accurate and our reporting on time. The role covers day-to-day bookkeeping through to month-end close, working directly with the people who spend the money.',
    responsibilities:
      'Record and reconcile transactions\nPrepare monthly management accounts\nManage accounts payable and receivable\nSupport the annual audit\nFlag anything that looks wrong before it becomes a problem',
    requirements:
      'Accounting qualification, or substantial equivalent experience\nStrong Excel skills\nMeticulous with detail and comfortable saying when the numbers do not add up\nAble to explain a number to someone who is not an accountant',
  },
  {
    title: 'Teacher',
    aliases: ['teacher', 'tutor', 'lecturer', 'instructor', 'teaching'],
    categorySlug: 'education',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'Teaching, Lesson planning, Classroom management, Assessment',
    description:
      'We are looking for a teacher who can plan properly, hold a room, and adjust what they teach based on how the students are actually doing.',
    responsibilities:
      'Plan and deliver lessons against the curriculum\nAssess progress and change your approach when something is not landing\nManage the classroom\nCommunicate with parents about progress\nContribute to the wider life of the school',
    requirements:
      'Degree in the subject or in education\nTeaching qualification, or willingness to complete one\nStrong classroom management\nPatience and clear explanation',
  },
  {
    title: 'Driver',
    aliases: ['driver', 'chauffeur', 'delivery driver', 'dispatch rider', 'rider'],
    categorySlug: 'operations',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    skills: 'Driving, Route planning, Punctuality, Vehicle maintenance',
    description:
      'We are hiring a reliable driver. Punctuality and a clean driving record matter more than anything else here.',
    responsibilities:
      'Drive staff or goods safely and on time\nPlan routes and allow for traffic\nKeep the vehicle clean, fuelled and serviced\nKeep a simple log of trips\nReport any fault or incident immediately',
    requirements:
      'Valid driving licence with a clean record\nGood knowledge of the local road network\nPunctual and presentable\nAble to read and follow a schedule',
  },
  {
    title: 'Marketing Manager',
    aliases: ['marketing', 'digital marketing', 'marketing manager', 'growth', 'social media manager'],
    categorySlug: 'marketing',
    employment: 'FULL_TIME',
    experience: 'SENIOR',
    skills: 'Marketing strategy, SEO, Social media, Data analysis',
    description:
      'We are looking for a marketing manager to own how we reach customers — channels, budget and message. You will be expected to show what worked with numbers, not adjectives.',
    responsibilities:
      'Own the marketing plan and the budget behind it\nRun campaigns across the channels that actually work for us\nManage our social media and content\nReport results weekly, including the things that failed\nWork with sales so the leads you generate are the ones they can close',
    requirements:
      'Experience running marketing with real budget responsibility\nComfortable in the data yourself, not waiting for someone to send a report\nStrong writing\nAble to prioritise when everything is asked for at once',
  },
  {
    title: 'Graphic Designer',
    aliases: ['graphic designer', 'designer', 'ui designer', 'brand designer', 'creative'],
    categorySlug: 'marketing',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'Graphic design, Figma, Adobe Creative Suite, Branding',
    description:
      'We need a designer to produce the visual work behind our brand — social, print, presentations and product. A portfolio matters more here than a CV.',
    responsibilities:
      'Design assets for social media, print and the web\nKeep everything consistent with the brand\nWork from a brief and ask when the brief is unclear\nTake feedback and iterate without taking it personally\nManage several pieces of work at once',
    requirements:
      'A portfolio you can talk through\nStrong skills in Figma or the Adobe suite\nGood eye for typography and layout\nAble to meet deadlines',
  },
  {
    title: 'Registered Nurse',
    aliases: ['nurse', 'nursing', 'registered nurse', 'healthcare assistant', 'caregiver'],
    categorySlug: 'healthcare',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'Nursing, Patient care, Documentation, Communication',
    description:
      'We are looking for a registered nurse to deliver care, keep accurate records and work well within a multidisciplinary team.',
    responsibilities:
      'Assess, plan and deliver patient care\nAdminister medication safely\nKeep accurate clinical records\nWork alongside doctors and allied health staff\nSupport newer colleagues',
    requirements:
      'Current nursing registration with no restrictions\nPost-registration experience\nStrong documentation discipline\nCalm under pressure',
  },
  {
    title: 'Security Officer',
    aliases: ['security', 'security guard', 'security officer', 'guard'],
    categorySlug: 'operations',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    skills: 'Security, Vigilance, Reporting, Communication',
    description:
      'We are hiring a security officer to keep the premises and the people in them safe. Alertness and clear reporting are the core of the job.',
    responsibilities:
      'Control access and check visitors in\nPatrol the premises on a set schedule\nMonitor cameras and alarms\nWrite up incidents clearly and promptly\nRespond calmly to emergencies',
    requirements:
      'Alert and observant\nAble to stay composed in a confrontation\nClear written reporting\nWilling to work shifts, including nights or weekends',
  },
  {
    title: 'Receptionist',
    aliases: ['receptionist', 'front desk', 'front office', 'office assistant'],
    categorySlug: 'operations',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    skills: 'Customer service, Organisation, Communication, Scheduling',
    description:
      'We are looking for a receptionist to be the first person visitors and callers deal with. You set the impression people have of us before anyone else speaks to them.',
    responsibilities:
      'Greet visitors and direct them to the right person\nAnswer and route calls\nManage meeting room bookings\nHandle post and deliveries\nKeep the reception area presentable',
    requirements:
      'Friendly and presentable\nOrganised, and able to handle interruptions without losing the thread\nBasic computer skills\nClear spoken English',
  },
  {
    title: 'Data Analyst',
    aliases: ['data analyst', 'analyst', 'business analyst', 'data', 'reporting analyst'],
    categorySlug: 'technology',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'SQL, Excel, Data analysis, Communication',
    description:
      'We need a data analyst to turn our data into decisions people actually make. Being able to explain the answer clearly matters as much as finding it.',
    responsibilities:
      'Build and maintain the reporting the team relies on\nAnswer questions with data, and be clear about how confident the answer is\nAutomate reports that are currently rebuilt by hand\nWork with the teams who own the data to improve its quality\nPresent findings to people who will act on them',
    requirements:
      'Strong SQL\nAdvanced spreadsheet skills\nAble to explain an analysis to a non-technical audience\nCurious about why a number moved, not just that it did',
  },
  {
    title: 'Cleaner',
    aliases: ['cleaner', 'cleaning', 'housekeeper', 'janitor', 'domestic staff'],
    categorySlug: 'operations',
    employment: 'PART_TIME',
    experience: 'ENTRY',
    skills: 'Cleaning, Reliability, Attention to detail',
    description:
      'We are looking for a reliable cleaner to keep our premises clean and presentable. Turning up consistently is the most important part of the job.',
    responsibilities:
      'Clean assigned areas to the agreed standard\nRestock supplies\nHandle cleaning products safely\nReport maintenance issues you notice\nWork to a schedule',
    requirements:
      'Reliable and punctual\nThorough, with an eye for the bits people miss\nAble to work independently\nPrevious cleaning experience is helpful but not required',
  },
  {
    title: 'Human Resources Officer',
    aliases: ['hr', 'human resources', 'hr officer', 'recruiter', 'people officer'],
    categorySlug: 'operations',
    employment: 'FULL_TIME',
    experience: 'MID',
    skills: 'Recruitment, Employee relations, HR administration, Communication',
    description:
      'We are hiring an HR officer to look after recruitment, records and the day-to-day questions staff bring. Discretion is essential.',
    responsibilities:
      'Run recruitment from advert through to offer\nMaintain accurate employee records\nSupport managers with employee relations\nHandle onboarding so new starters are set up properly\nKeep our practices in line with employment law',
    requirements:
      'HR experience, or a related qualification\nDiscreet with confidential information\nStrong written communication\nOrganised and comfortable with detail',
  },
]

/**
 * Ranked template search over title and aliases.
 *
 * Deliberately simple substring matching rather than fuzzy scoring: a recruiter
 * typing "custom" should see Customer Service immediately, and predictable
 * behaviour beats clever behaviour in an autocomplete.
 */
export function findTemplates(query: string, limit = 5): JobTemplate[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const scored = jobTemplates
    .map((template) => {
      const title = template.title.toLowerCase()
      let score = 0
      if (title === q) score = 100
      else if (title.startsWith(q)) score = 80
      else if (title.includes(q)) score = 60
      else if (template.aliases.some((alias) => alias.startsWith(q))) score = 50
      else if (template.aliases.some((alias) => alias.includes(q) || q.includes(alias))) score = 30
      return { template, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((entry) => entry.template)
}

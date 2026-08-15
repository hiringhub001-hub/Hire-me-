/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { allArticles } from '../content/posts'

const prisma = new PrismaClient()

const categories = [
  {
    slug: 'technology',
    name: 'Technology',
    description:
      'Software engineering, data, infrastructure and product roles. The fastest-moving category on the site, and the one where a portfolio counts for most.',
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    description:
      'Clinical and allied health roles. Registration and licensing requirements vary by country, so check them before applying abroad.',
  },
  {
    slug: 'finance',
    name: 'Finance & Accounting',
    description:
      'Accounting, audit, analysis and financial operations. Qualifications carry more weight here than in most sectors.',
  },
  {
    slug: 'marketing',
    name: 'Marketing & Sales',
    description:
      'Demand generation, content, brand and revenue roles. Bring numbers: pipeline, traffic, conversion, retention.',
  },
  {
    slug: 'engineering',
    name: 'Engineering',
    description:
      'Mechanical, civil, electrical and manufacturing engineering, where chartered status and safety record matter.',
  },
  {
    slug: 'education',
    name: 'Education',
    description:
      'Teaching, training and academic support roles across schools, colleges and corporate learning.',
  },
  {
    slug: 'customer-support',
    name: 'Customer Support',
    description:
      'Support, success and service roles. High-volume hiring with fast processes and heavy use of role play at interview.',
  },
  {
    slug: 'operations',
    name: 'Operations & Logistics',
    description:
      'Supply chain, warehousing, transport and business operations — the roles that keep everything else running.',
  },
]

const companies = [
  {
    slug: 'northwind-labs',
    name: 'Northwind Labs',
    tagline: 'Analytics tooling for mid-market retailers',
    industry: 'Software',
    size: '120 employees',
    founded: 2017,
    headquarters: 'Manchester, United Kingdom',
    website: 'https://example.com/northwind',
    description:
      'Northwind Labs builds reporting and forecasting software used by regional retail chains to plan stock and staffing. The engineering team is small relative to the customer base, which means engineers here talk to customers directly and own features from design through to support. Hiring is deliberately slow and the interview process is unusually transparent about scope and pay.',
    culture:
      'Written-first: decisions are documented in short proposals before meetings. Core hours are 10:00 to 15:00 UK time with flexibility either side. No on-call rota for product engineers.',
    benefits:
      '28 days annual leave plus public holidays\nRemote-first within the UK with quarterly team weeks\n£1,200 annual learning budget\nEnhanced parental leave from day one\nCompany pension with 6% employer contribution',
  },
  {
    slug: 'meridian-health-group',
    name: 'Meridian Health Group',
    tagline: 'Community clinics across three regions',
    industry: 'Healthcare',
    size: '2,400 employees',
    founded: 2004,
    headquarters: 'Birmingham, United Kingdom',
    website: 'https://example.com/meridian',
    description:
      'Meridian Health Group operates community clinics and outpatient services, with a focus on chronic condition management. Clinical staff work in multidisciplinary teams and rotas are published six weeks ahead, which is unusual in the sector and consistently cited by staff as the main reason they stay.',
    culture:
      'Structured supervision, funded revalidation, and a preceptorship programme for newly registered staff. Shift patterns are agreed in advance rather than assigned week to week.',
    benefits:
      'Funded revalidation and CPD\nSix-week advance rota publication\nUnsocial hours enhancements\nSubsidised on-site parking\nOccupational health and counselling access',
  },
  {
    slug: 'atlas-financial',
    name: 'Atlas Financial Services',
    tagline: 'Independent financial advisory and audit',
    industry: 'Financial Services',
    size: '600 employees',
    founded: 1998,
    headquarters: 'Dublin, Ireland',
    website: 'https://example.com/atlas',
    description:
      'Atlas Financial Services provides audit, tax and advisory work for owner-managed businesses across Ireland and the UK. It is a training-heavy firm: study leave and exam fees are funded for accounting qualifications, and a large share of the senior team qualified there.',
    culture:
      'Traditional professional services structure with clear progression bands. Busy season is real and acknowledged; time off in lieu is standard rather than discretionary.',
    benefits:
      'Fully funded professional qualifications with study leave\nHybrid working, two days in office\nAnnual bonus tied to firm and individual performance\nPension with 8% employer contribution\nHealth insurance for employee and partner',
  },
  {
    slug: 'brightpath-education',
    name: 'BrightPath Education',
    tagline: 'Tutoring and curriculum design',
    industry: 'Education',
    size: '85 employees',
    founded: 2015,
    headquarters: 'Lagos, Nigeria',
    website: 'https://example.com/brightpath',
    description:
      'BrightPath Education designs curriculum materials and runs supplementary tutoring programmes for secondary students, working with schools across West Africa. The organisation publishes its learning outcomes openly, including where programmes have underperformed, which is rare in the sector.',
    culture:
      'Teaching staff get protected planning time and a mentor for the first two terms. Programme decisions are made with teacher input rather than handed down.',
    benefits:
      'Protected planning time\nFunded teaching qualifications\nAnnual curriculum conference attendance\nHealth cover\nTransport allowance',
  },
  {
    slug: 'ferrous-works',
    name: 'Ferrous Works',
    tagline: 'Precision manufacturing for the energy sector',
    industry: 'Manufacturing',
    size: '340 employees',
    founded: 1986,
    headquarters: 'Leeds, United Kingdom',
    website: 'https://example.com/ferrous',
    description:
      'Ferrous Works manufactures precision components for energy infrastructure, working to tight tolerance and heavy documentation requirements. Safety performance is published internally each month and the company has run without a reportable incident for three years.',
    culture:
      'Shop-floor experience is valued in engineering roles and several of the current engineering leads started on the floor. Apprenticeships run every intake year.',
    benefits:
      'Chartership support and mentoring\nOvertime paid at premium rates\nDefined contribution pension with 7% match\nOn-site canteen and parking\nAnnual profit share',
  },
  {
    slug: 'cadence-commerce',
    name: 'Cadence Commerce',
    tagline: 'Direct-to-consumer brand operations',
    industry: 'E-commerce',
    size: '210 employees',
    founded: 2019,
    headquarters: 'Remote, European Union',
    website: 'https://example.com/cadence',
    description:
      'Cadence Commerce runs operations, marketing and fulfilment for a portfolio of direct-to-consumer brands. It has been fully remote since founding and publishes its salary bands internally, so pay is not negotiated individually — a policy that suits some candidates and not others.',
    culture:
      'Asynchronous by default with a four-hour overlap requirement. Written updates replace most status meetings. Documented on-call for operations roles only.',
    benefits:
      'Fully remote within the EU\nPublished salary bands, no individual negotiation\n30 days annual leave\n€1,500 home office budget\nAnnual all-company gathering, travel paid',
  },
]

type SeedJob = {
  slug: string
  title: string
  company: string
  category: string
  city: string
  country: string
  workMode: string
  employment: string
  experience: string
  education?: string
  salaryMin?: number
  salaryMax?: number
  salaryPeriod?: string
  currency: string
  skills: string
  description: string
  responsibilities: string
  requirements: string
  benefits?: string
  certifications?: string
  source: string
  sourceName?: string
  externalUrl?: string
  allowInternal: boolean
  featured?: boolean
  daysAgo: number
  editorialSummary?: string
}

const jobs: SeedJob[] = [
  {
    slug: 'frontend-developer-manchester',
    title: 'Frontend Developer',
    company: 'northwind-labs',
    category: 'technology',
    city: 'Manchester',
    country: 'United Kingdom',
    workMode: 'HYBRID',
    employment: 'FULL_TIME',
    experience: 'MID',
    education: 'BACHELOR',
    salaryMin: 48000,
    salaryMax: 62000,
    currency: 'GBP',
    skills: 'React, TypeScript, Next.js, CSS, Accessibility, Testing',
    description:
      'Join the product engineering team building the reporting interfaces our retail customers use every morning to plan their day. You will work on data-dense screens where performance and clarity matter more than visual novelty.',
    responsibilities:
      'Build and maintain data-heavy reporting screens in React and TypeScript\nWork directly with two designers on component design and interaction patterns\nImprove page performance against agreed Core Web Vitals targets\nContribute to the shared component library used across three products\nJoin customer calls once a fortnight to see the software used in context',
    requirements:
      'Three or more years building production React applications\nStrong TypeScript, including modelling API responses you do not control\nConfident with CSS layout and able to debug someone else\'s stylesheet\nPractical understanding of web accessibility, including keyboard and screen reader behaviour\nExperience writing tests that describe user behaviour',
    benefits:
      '28 days leave plus public holidays\nTwo office days a week, three from home\n£1,200 learning budget\n6% employer pension contribution',
    source: 'DIRECT',
    allowInternal: true,
    featured: true,
    daysAgo: 2,
    editorialSummary:
      'This is a product engineering role rather than a pure UI one: Northwind is a small team relative to its customer base, so the frontend developer here will be expected to talk to retail customers directly and make interface decisions without a product manager translating. The data-density of the screens is the technical crux — candidates who can talk credibly about rendering large tables, virtualisation and perceived performance will interview well. The hybrid pattern is genuinely two days on site in Manchester, so this is not a remote role in disguise.',
  },
  {
    slug: 'senior-react-engineer-remote-eu',
    title: 'Senior React Engineer',
    company: 'cadence-commerce',
    category: 'technology',
    city: 'Remote',
    country: 'European Union',
    workMode: 'REMOTE',
    employment: 'FULL_TIME',
    experience: 'SENIOR',
    salaryMin: 75000,
    salaryMax: 95000,
    currency: 'EUR',
    skills: 'React, TypeScript, Next.js, Node.js, Testing, Performance',
    description:
      'Own the storefront experience across a portfolio of consumer brands, working asynchronously with a distributed team of fourteen engineers.',
    responsibilities:
      'Lead frontend architecture for the shared storefront platform\nSet performance budgets and hold the team to them\nMentor three mid-level engineers through structured code review\nWrite design proposals that are debated in writing before implementation\nPartner with the operations team on checkout reliability',
    requirements:
      'Five or more years of frontend engineering, including two at senior level\nDeep React and TypeScript experience in a production codebase\nDemonstrated ownership of performance work with measurable outcomes\nStrong written communication — this team runs on documents, not meetings\nEligibility to work in an EU member state',
    benefits:
      'Fully remote within the EU\n30 days annual leave\n€1,500 home office budget\nPublished salary bands',
    source: 'LINKEDIN',
    sourceName: 'LinkedIn',
    externalUrl: 'https://www.linkedin.com/jobs/',
    allowInternal: false,
    featured: true,
    daysAgo: 4,
  },
  {
    slug: 'data-analyst-dublin',
    title: 'Data Analyst',
    company: 'atlas-financial',
    category: 'finance',
    city: 'Dublin',
    country: 'Ireland',
    workMode: 'HYBRID',
    employment: 'FULL_TIME',
    experience: 'MID',
    education: 'BACHELOR',
    salaryMin: 55000,
    salaryMax: 70000,
    currency: 'EUR',
    skills: 'SQL, Excel, Data Analysis, Communication, Python',
    description:
      'Support the advisory practice with analysis that partners rely on in client conversations — from margin analysis to cash flow modelling for owner-managed businesses.',
    responsibilities:
      'Build and maintain the reporting used by the advisory practice\nProduce client-facing analysis with clearly stated assumptions and caveats\nAutomate recurring reporting that is currently rebuilt manually each month\nWork with the audit team to improve data quality at source\nPresent findings to partners and, occasionally, to clients',
    requirements:
      'Three years in an analytical role, ideally in professional services or financial services\nStrong SQL, including joins and window functions\nAdvanced Excel modelling\nAbility to explain an analysis to someone who will act on it\nDegree in a numerate discipline or an equivalent qualification',
    benefits:
      'Hybrid working, two days in office\nFunded professional qualifications\n8% employer pension\nAnnual bonus',
    source: 'INDEED',
    sourceName: 'Indeed',
    externalUrl: 'https://www.indeed.com/',
    allowInternal: true,
    daysAgo: 6,
  },
  {
    slug: 'registered-nurse-birmingham',
    title: 'Registered Nurse — Community Clinics',
    company: 'meridian-health-group',
    category: 'healthcare',
    city: 'Birmingham',
    country: 'United Kingdom',
    workMode: 'ONSITE',
    employment: 'FULL_TIME',
    experience: 'MID',
    education: 'BACHELOR',
    salaryMin: 32000,
    salaryMax: 39000,
    currency: 'GBP',
    skills: 'Nursing, Communication, Patient assessment, Documentation',
    description:
      'Deliver care in community clinics with a focus on chronic condition management, working in a multidisciplinary team with published rotas six weeks ahead.',
    responsibilities:
      'Assess, plan and deliver care for patients with long-term conditions\nAdminister medication safely and maintain accurate records\nWork alongside GPs, pharmacists and allied health professionals\nSupport newly registered colleagues through the preceptorship programme\nContribute to clinical audit and service improvement',
    requirements:
      'Current NMC registration with no restrictions\nTwo or more years of post-registration experience\nExperience in community, practice or outpatient settings\nStrong documentation discipline\nRight to work in the United Kingdom',
    certifications:
      'NMC registration (required)\nBasic Life Support, current\nSafeguarding Level 3 (or willingness to complete within three months)',
    benefits:
      'Six-week advance rota publication\nFunded revalidation and CPD\nUnsocial hours enhancements\nOccupational health support',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 1,
  },
  {
    slug: 'mechanical-design-engineer-leeds',
    title: 'Mechanical Design Engineer',
    company: 'ferrous-works',
    category: 'engineering',
    city: 'Leeds',
    country: 'United Kingdom',
    workMode: 'ONSITE',
    employment: 'FULL_TIME',
    experience: 'SENIOR',
    education: 'BACHELOR',
    salaryMin: 52000,
    salaryMax: 66000,
    currency: 'GBP',
    skills: 'CAD, Mechanical design, Tolerance analysis, Project management',
    description:
      'Design precision components for energy infrastructure, working to tight tolerances and a heavy documentation standard alongside a shop floor you can walk onto.',
    responsibilities:
      'Produce detailed designs and drawings for precision components\nRun tolerance and failure analysis on new designs\nWork directly with machinists to make designs manufacturable\nMaintain design documentation to customer and regulatory standard\nSupport the apprenticeship programme with technical mentoring',
    requirements:
      'Degree in mechanical engineering or equivalent\nFive years in a design role within manufacturing\nStrong CAD skills and experience of design for manufacture\nExperience working to documented quality standards\nWorking towards or holding chartered status',
    certifications:
      'Chartered Engineer status or active progression towards it\nIOSH or equivalent safety training',
    benefits:
      'Chartership support and mentoring\nPremium overtime rates\n7% pension match\nAnnual profit share',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 9,
  },
  {
    slug: 'customer-support-specialist-remote',
    title: 'Customer Support Specialist',
    company: 'cadence-commerce',
    category: 'customer-support',
    city: 'Remote',
    country: 'European Union',
    workMode: 'REMOTE',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    salaryMin: 30000,
    salaryMax: 36000,
    currency: 'EUR',
    skills: 'Customer service, Communication, Problem solving',
    description:
      'First line support across a portfolio of consumer brands, handling order, delivery and returns queries by email and chat with no phone queue.',
    responsibilities:
      'Resolve customer queries by email and live chat within agreed response times\nEscalate delivery and payment issues to the operations team with full context\nSpot recurring problems and raise them rather than absorbing them\nMaintain the public help centre articles for your brands\nContribute to weekly quality review sessions',
    requirements:
      'Some experience in a customer-facing role — retail and hospitality count\nExcellent written English; a second European language is an advantage\nComfortable working asynchronously with a four-hour overlap\nCalm under pressure and genuinely willing to be told when you got it wrong\nEligibility to work in an EU member state',
    benefits:
      'Fully remote within the EU\n30 days annual leave\nNo phone queue — written support only\nPublished salary bands',
    source: 'INDEED',
    sourceName: 'Indeed',
    externalUrl: 'https://www.indeed.com/',
    allowInternal: true,
    daysAgo: 3,
  },
  {
    slug: 'secondary-mathematics-teacher-lagos',
    title: 'Secondary Mathematics Teacher',
    company: 'brightpath-education',
    category: 'education',
    city: 'Lagos',
    country: 'Nigeria',
    workMode: 'ONSITE',
    employment: 'FULL_TIME',
    experience: 'MID',
    education: 'BACHELOR',
    salaryMin: 6000000,
    salaryMax: 9000000,
    currency: 'NGN',
    skills: 'Teaching, Curriculum design, Communication, Assessment',
    description:
      'Teach mathematics to secondary students across our tutoring programmes, with protected planning time and a mentor for your first two terms.',
    responsibilities:
      'Plan and deliver mathematics lessons against the programme curriculum\nAssess student progress and adjust teaching in response\nContribute to curriculum materials used across partner schools\nRun weekly small-group sessions for students needing additional support\nCommunicate progress to parents each half term',
    requirements:
      'Degree in mathematics, education or a related discipline\nThree years of secondary teaching experience\nStrong classroom management\nComfort with data — you will be asked to explain progress with evidence\nTeaching qualification or willingness to complete a funded one',
    certifications: 'Teaching qualification (funded if not already held)',
    benefits:
      'Protected planning time\nFunded teaching qualification\nTransport allowance\nHealth cover',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 5,
  },
  {
    slug: 'digital-marketing-manager-remote',
    title: 'Digital Marketing Manager',
    company: 'cadence-commerce',
    category: 'marketing',
    city: 'Remote',
    country: 'European Union',
    workMode: 'REMOTE',
    employment: 'FULL_TIME',
    experience: 'SENIOR',
    salaryMin: 60000,
    salaryMax: 78000,
    currency: 'EUR',
    skills: 'SEO, Data analysis, Communication, Project management',
    description:
      'Own acquisition across three consumer brands, with full budget responsibility and an analyst who reports into you.',
    responsibilities:
      'Own paid and organic acquisition targets across three brands\nManage a monthly media budget in the mid six figures\nSet the content and SEO roadmap with two writers\nReport performance weekly in writing to the leadership team\nRun structured experiments and kill what does not work',
    requirements:
      'Five years in digital marketing with direct budget ownership\nDemonstrable SEO results with before and after figures\nStrong analytical skills — you should be comfortable in the data yourself\nExperience managing at least one direct report\nEligibility to work in an EU member state',
    source: 'LINKEDIN',
    sourceName: 'LinkedIn',
    externalUrl: 'https://www.linkedin.com/jobs/',
    allowInternal: false,
    daysAgo: 7,
  },
  {
    slug: 'junior-frontend-developer-manchester',
    title: 'Junior Frontend Developer',
    company: 'northwind-labs',
    category: 'technology',
    city: 'Manchester',
    country: 'United Kingdom',
    workMode: 'HYBRID',
    employment: 'FULL_TIME',
    experience: 'JUNIOR',
    salaryMin: 30000,
    salaryMax: 38000,
    currency: 'GBP',
    skills: 'React, TypeScript, CSS, Testing',
    description:
      'A structured first or second developer role with real mentoring: paired code review, a named mentor, and work scoped so you can finish it.',
    responsibilities:
      'Build features in React and TypeScript with support from a named mentor\nFix well-scoped bugs end to end, including writing the test\nParticipate in code review both as author and reviewer\nContribute to the component library documentation\nJoin customer calls to see how the product is actually used',
    requirements:
      'Some professional or substantial project experience with React\nWorking knowledge of TypeScript, or clear enthusiasm to learn it properly\nSolid HTML and CSS fundamentals\nWillingness to ask questions early rather than get stuck quietly\nRight to work in the United Kingdom',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 8,
  },
  {
    slug: 'operations-coordinator-manchester',
    title: 'Operations Coordinator',
    company: 'northwind-labs',
    category: 'operations',
    city: 'Manchester',
    country: 'United Kingdom',
    workMode: 'HYBRID',
    employment: 'FULL_TIME',
    experience: 'ENTRY',
    salaryMin: 26000,
    salaryMax: 31000,
    currency: 'GBP',
    skills: 'Excel, Communication, Project management, Customer service',
    description:
      'Keep the internal machinery running: onboarding new customers, coordinating the support rota, and owning the reporting the leadership team reads on Monday.',
    responsibilities:
      'Coordinate customer onboarding across sales, support and engineering\nMaintain the weekly operations report\nOwn the support rota and holiday cover\nProcess supplier invoices and chase approvals\nImprove at least one manual process per quarter',
    requirements:
      'Strong organisational skills and genuine attention to detail\nConfident in spreadsheets — lookups and pivot tables at minimum\nClear written communication\nComfortable chasing people politely and persistently\nRight to work in the United Kingdom',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 11,
  },
  {
    slug: 'financial-accountant-dublin',
    title: 'Financial Accountant',
    company: 'atlas-financial',
    category: 'finance',
    city: 'Dublin',
    country: 'Ireland',
    workMode: 'HYBRID',
    employment: 'FULL_TIME',
    experience: 'MID',
    education: 'BACHELOR',
    salaryMin: 58000,
    salaryMax: 72000,
    currency: 'EUR',
    skills: 'Accounting, Excel, Communication, Data analysis',
    description:
      'Own the month-end close for a portfolio of owner-managed clients, with study support if you are still completing your qualification.',
    responsibilities:
      'Prepare statutory accounts for a portfolio of clients\nOwn month-end close and reconciliations\nLiaise directly with client finance contacts\nSupport the audit team during busy season\nIdentify and document process improvements at client sites',
    requirements:
      'Qualified or part-qualified accountant (ACA, ACCA or equivalent)\nThree years in practice or a comparable industry role\nStrong technical knowledge of the relevant reporting standards\nExcellent Excel skills\nComfortable dealing directly with business owners',
    certifications: 'ACA, ACCA or CIMA — qualified or actively studying',
    benefits:
      'Fully funded qualification with study leave\nHybrid, two days in office\n8% employer pension\nHealth insurance',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 14,
  },
  {
    slug: 'devops-engineer-remote-eu',
    title: 'DevOps Engineer',
    company: 'cadence-commerce',
    category: 'technology',
    city: 'Remote',
    country: 'European Union',
    workMode: 'REMOTE',
    employment: 'FULL_TIME',
    experience: 'MID',
    salaryMin: 65000,
    salaryMax: 85000,
    currency: 'EUR',
    skills: 'AWS, Docker, Kubernetes, Node.js, Python',
    description:
      'Keep the storefront platform fast and available across a portfolio of brands, with a documented on-call rota and time back in lieu.',
    responsibilities:
      'Own deployment pipelines and infrastructure as code\nImprove observability so incidents are diagnosed rather than guessed at\nParticipate in a documented on-call rota with time off in lieu\nControl cloud spend and report on it monthly\nWork with product engineers on reliability, not just after incidents',
    requirements:
      'Three or more years in a DevOps, SRE or platform role\nStrong AWS and container experience\nComfortable scripting in Python or Node.js\nExperience running production incidents and writing the post-mortem\nEligibility to work in an EU member state',
    source: 'LINKEDIN',
    sourceName: 'LinkedIn',
    externalUrl: 'https://www.linkedin.com/jobs/',
    allowInternal: false,
    daysAgo: 10,
  },
  {
    slug: 'healthcare-assistant-birmingham',
    title: 'Healthcare Assistant',
    company: 'meridian-health-group',
    category: 'healthcare',
    city: 'Birmingham',
    country: 'United Kingdom',
    workMode: 'ONSITE',
    employment: 'PART_TIME',
    experience: 'ENTRY',
    salaryMin: 12,
    salaryMax: 14,
    salaryPeriod: 'HOUR',
    currency: 'GBP',
    skills: 'Patient care, Communication, Customer service',
    description:
      'Support clinical teams in community clinics with a structured induction and a funded route into further healthcare training.',
    responsibilities:
      'Support patients with daily needs during clinic appointments\nTake and record basic observations\nPrepare clinical rooms and maintain stock\nSupport registered staff during procedures\nMaintain accurate records',
    requirements:
      'No previous healthcare experience required — induction is provided\nGood standard of written and spoken English\nCalm, patient manner and genuine care for people\nAbility to work a rota including some weekends\nRight to work in the United Kingdom',
    benefits:
      'Funded route into further healthcare training\nSix-week advance rotas\nUnsocial hours enhancements',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 12,
  },
  {
    slug: 'product-designer-remote-eu',
    title: 'Product Designer',
    company: 'northwind-labs',
    category: 'technology',
    city: 'Remote',
    country: 'United Kingdom',
    workMode: 'REMOTE',
    employment: 'CONTRACT',
    experience: 'SENIOR',
    salaryMin: 400,
    salaryMax: 500,
    salaryPeriod: 'HOUR',
    currency: 'GBP',
    skills: 'Figma, Communication, Data analysis, Accessibility',
    description:
      'A six-month contract to redesign the core reporting experience, working directly with engineering and with access to real customers.',
    responsibilities:
      'Redesign the core reporting flows in collaboration with two engineers\nRun research sessions with retail customers\nExtend the existing design system rather than replacing it\nProduce handover that engineers can build from without a meeting\nDocument the rationale for decisions so the work outlives the contract',
    requirements:
      'Six or more years designing complex, data-dense software\nA portfolio showing systems work, not only finished screens\nExperience running your own research\nComfortable working with engineers day to day\nAvailable for a six-month engagement, UK-based',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 16,
  },
  {
    slug: 'graduate-software-engineer-manchester',
    title: 'Graduate Software Engineer',
    company: 'northwind-labs',
    category: 'technology',
    city: 'Manchester',
    country: 'United Kingdom',
    workMode: 'HYBRID',
    employment: 'INTERNSHIP',
    experience: 'ENTRY',
    salaryMin: 26000,
    salaryMax: 29000,
    currency: 'GBP',
    skills: 'JavaScript, TypeScript, SQL, Communication',
    description:
      'A twelve-month graduate programme with rotation across frontend, backend and support, and a permanent role for those who complete it well.',
    responsibilities:
      'Rotate through frontend, backend and customer support over twelve months\nComplete a structured learning plan with a named mentor\nShip real, scoped work in each rotation\nPresent one improvement project at the end of the programme',
    requirements:
      'Degree in computing, engineering, mathematics or a related field, or equivalent self-taught evidence\nSome programming experience in any language\nCuriosity and willingness to ask questions\nRight to work in the United Kingdom for the duration',
    source: 'DIRECT',
    allowInternal: true,
    daysAgo: 18,
  },
  {
    slug: 'quality-inspector-leeds',
    title: 'Quality Inspector',
    company: 'ferrous-works',
    category: 'engineering',
    city: 'Leeds',
    country: 'United Kingdom',
    workMode: 'ONSITE',
    employment: 'FULL_TIME',
    experience: 'JUNIOR',
    salaryMin: 30000,
    salaryMax: 36000,
    currency: 'GBP',
    skills: 'Quality control, Documentation, Communication',
    description:
      'Inspect precision components against tight tolerance and documentation standards, on a day shift with premium-rate overtime available.',
    responsibilities:
      'Inspect components against drawings and tolerance specifications\nMaintain inspection records to customer and regulatory standard\nRaise and track non-conformances\nWork with machinists to resolve recurring issues at source\nSupport internal and customer audits',
    requirements:
      'Experience in a quality or inspection role within manufacturing\nAble to read engineering drawings confidently\nMeticulous record keeping\nComfortable raising issues with people more senior than you\nRight to work in the United Kingdom',
    certifications: 'Metrology or quality inspection certification is an advantage, not a requirement',
    source: 'INDEED',
    sourceName: 'Indeed',
    externalUrl: 'https://www.indeed.com/',
    allowInternal: true,
    daysAgo: 20,
  },
]

/**
 * Demo companies and job adverts are illustrative — the employers do not exist
 * and their websites are example.com. They must never reach a live site: Google
 * AdSense treats invented listings as misleading content, and a job seeker
 * applying to one is being wasted.
 *
 * They stay in this file because they are useful for local development, but
 * they are only created when you ask for them explicitly:
 *
 *   SEED_DEMO_CONTENT=true npm run db:seed
 */
const SEED_DEMO_CONTENT = process.env.SEED_DEMO_CONTENT === 'true'

async function main() {
  console.log('Seeding…')

  // Categories are taxonomy with editorial descriptions, and the articles are
  // original guides written for this site. Both are real content and are always
  // kept in step. Nothing else here is destructive: live jobs, companies,
  // applications and user accounts are left exactly as they are.
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    })
  }
  console.log(`  categories: ${categories.length} (upserted)`)

  for (const article of allArticles) {
    const data = {
      kind: article.kind,
      title: article.title,
      excerpt: article.excerpt,
      body: JSON.stringify({ sections: article.sections, faqs: article.faqs ?? [] }),
      category: article.category,
      tags: article.tags.join(', '),
      authorName: article.authorName,
      authorRole: article.authorRole,
      readMinutes: article.readMinutes,
      published: true,
    }
    await prisma.post.upsert({
      where: { kind_slug: { kind: article.kind, slug: article.slug } },
      update: data,
      create: { ...data, slug: article.slug, publishedAt: new Date(article.publishedAt) },
    })
  }
  console.log(`  articles: ${allArticles.length} (upserted)`)

  if (!SEED_DEMO_CONTENT) {
    const jobCount = await prisma.job.count()
    console.log(`
Skipped demo companies and job adverts — they are illustrative and must not
appear on a live site. Left the ${jobCount} existing job(s) untouched.

For a local sandbox with sample listings:
  SEED_DEMO_CONTENT=true npm run db:seed
`)
    return
  }

  console.log('\n  SEED_DEMO_CONTENT=true — creating illustrative demo content.')
  console.log('  Do not run this against production.\n')

  const password = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@careerhub.com.ng' },
    update: { role: 'ADMIN', passwordHash: password },
    create: {
      email: 'admin@careerhub.com.ng',
      passwordHash: password,
      name: 'Site Admin',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@careerhub.com.ng' },
    update: {},
    create: {
      email: 'candidate@careerhub.com.ng',
      passwordHash: password,
      name: 'Ada Okafor',
      role: 'CANDIDATE',
      emailVerified: new Date(),
      headline: 'Frontend developer — React, TypeScript',
      location: 'Manchester, United Kingdom',
      skills: 'React, TypeScript, CSS, Testing',
      phone: '+44 7700 900123',
    },
  })

  const employer = await prisma.user.upsert({
    where: { email: 'employer@careerhub.com.ng' },
    update: {},
    create: {
      email: 'employer@careerhub.com.ng',
      passwordHash: password,
      name: 'Jordan Reeve',
      role: 'EMPLOYER',
      emailVerified: new Date(),
    },
  })

  for (const [index, company] of companies.entries()) {
    const [city = 'Remote', country = 'United Kingdom'] = company.headquarters.split(', ')
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: {},
      create: {
        ...company,
        approved: true,
        featured: index < 3,
        ownerId: index === 0 ? employer.id : null,
        locations: { create: [{ city, country, isPrimary: true }] },
      },
    })
  }

  const categoryMap = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]),
  )
  const companyMap = new Map(
    (await prisma.company.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]),
  )

  for (const job of jobs) {
    const postedAt = new Date(Date.now() - job.daysAgo * 24 * 60 * 60 * 1000)
    const expiresAt = new Date(postedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
    const companyId = companyMap.get(job.company)
    if (!companyId) throw new Error(`Unknown company: ${job.company}`)

    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: {
        slug: job.slug,
        title: job.title,
        description: job.description,
        companyId,
        categoryId: categoryMap.get(job.category) ?? null,
        authorId: employer.id,
        city: job.city,
        country: job.country,
        workMode: job.workMode,
        employment: job.employment,
        experience: job.experience,
        education: job.education ?? null,
        salaryMin: job.salaryMin ?? null,
        salaryMax: job.salaryMax ?? null,
        salaryPeriod: job.salaryPeriod ?? 'YEAR',
        currency: job.currency,
        skills: job.skills,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits ?? null,
        certifications: job.certifications ?? null,
        source: job.source,
        sourceName: job.sourceName ?? null,
        externalUrl: job.externalUrl ?? null,
        allowInternal: job.allowInternal,
        editorialSummary: job.editorialSummary ?? null,
        status: 'PUBLISHED',
        featured: job.featured ?? false,
        postedAt,
        expiresAt,
        views: Math.floor(40 + job.daysAgo * 17),
      },
    })
  }

  console.log(`  demo: ${companies.length} companies, ${jobs.length} jobs`)
  console.log('  logins (password123):', admin.email, employer.email, candidate.email)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

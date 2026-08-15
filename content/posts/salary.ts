import type { ArticleSeed } from '@/content/posts/types'

export const salaryArticles: ArticleSeed[] = [
  {
    slug: 'frontend-developer',
    kind: 'SALARY',
    title: 'Frontend developer salary guide',
    excerpt:
      'What frontend developers earn by experience level and location, which factors move pay the most, and how to work out your own number before a negotiation.',
    category: 'Technology',
    tags: ['salary', 'frontend', 'developer'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Pay and compensation desk',
    readMinutes: 8,
    publishedAt: '2026-03-11',
    sections: [
      {
        heading: 'How to read any salary guide, including this one',
        body: [
          'Published salary figures are averages of self-reported data, and they age quickly. Treat every number here as a starting point for a conversation rather than a fact about your worth.',
          'Three adjustments matter more than the headline figure: the cost base of the location, the size and funding stage of the employer, and whether the number quoted is base pay or total package. A figure that includes bonus and equity is not comparable to one that does not.',
        ],
      },
      {
        heading: 'Typical ranges by experience',
        body: [
          'The bands below describe base salary for frontend roles in medium-sized companies in higher-income markets, stated in US dollars for comparability. Adjust down for smaller markets and up for major technology hubs and large listed employers.',
        ],
        bullets: [
          'Entry level (0–1 years): roughly $45,000–$65,000. Expect strong supervision and a structured onboarding.',
          'Junior (1–3 years): roughly $60,000–$85,000. You own features, not systems.',
          'Mid level (3–5 years): roughly $80,000–$115,000. The widest band, because scope varies most here.',
          'Senior (5–8 years): roughly $110,000–$155,000. You are expected to make architectural calls and raise others.',
          'Lead / Principal (8+ years): roughly $140,000–$200,000+, with a growing share in bonus or equity.',
        ],
      },
      {
        heading: 'What moves the number most',
        steps: [
          'Location and the employer\'s pay policy. Some companies pay a single global rate; most band by market. This is the largest single factor.',
          'Company type. Large listed technology firms pay well above agencies and non-technology employers for the same title.',
          'Specialisation. Accessibility, performance engineering and design systems command a premium because the supply is genuinely thin.',
          'Breadth. Frontend developers who can own an API integration end to end sit at the top of their band more often.',
          'Negotiation. Consistently worth five to fifteen percent, and it compounds across every subsequent raise.',
        ],
      },
      {
        heading: 'Beyond base pay',
        bullets: [
          'Bonus: commonly 5–20% at mid level, larger and more variable at senior levels.',
          'Equity: material at funded startups and large listed firms. Ask about vesting, cliff, and the strike price before assigning it any value.',
          'Pension or retirement contribution: an employer match is real money and is frequently overlooked in comparisons.',
          'Annual leave: five extra days is roughly two percent of your salary in time.',
          'Learning budget, equipment allowance, and healthcare, which varies enormously in value by country.',
        ],
      },
      {
        heading: 'Working out your own number',
        steps: [
          'Collect five current adverts for the same title, level and location that publish a range.',
          'Take the midpoint of each and find the median of those midpoints. That is your market anchor.',
          'Adjust up for a scarce specialisation, a larger employer, or responsibilities beyond the title.',
          'Set your walk-away figure below that, and your ask above it.',
          'Write one sentence justifying the ask in terms of what you deliver. If you cannot, revise the number rather than the sentence.',
        ],
      },
      {
        heading: 'When the advert does not state a salary',
        body: [
          'A missing salary is not a red flag on its own — many employers still treat bands as confidential, and some are legally required to publish them only in certain jurisdictions.',
          'Ask at the first screening call. A recruiter who will not share a band at all, at any point, is telling you something about how the negotiation will go.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do frontend developers earn less than backend developers?',
        answer:
          'Historically yes, by a small margin, and the gap has largely closed at senior levels. Where a difference persists it usually reflects scope rather than discipline — developers who own systems end to end are paid for the ownership.',
      },
      {
        question: 'Is it worth learning a framework specifically for pay?',
        answer:
          'Framework choice moves pay far less than level and scope do. Depth in one ecosystem plus fundamentals that transfer will out-earn a shallow familiarity with four frameworks.',
      },
    ],
  },
  {
    slug: 'data-analyst',
    kind: 'SALARY',
    title: 'Data analyst salary guide',
    excerpt:
      'Pay ranges for data analysts by level, the difference between analyst and analytics engineer pay, and where the ceiling sits before you need to specialise.',
    category: 'Data',
    tags: ['salary', 'data', 'analyst'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Pay and compensation desk',
    readMinutes: 7,
    publishedAt: '2026-04-02',
    sections: [
      {
        heading: 'The shape of the market',
        body: [
          'Data analyst is one of the widest job titles in the market. It covers people producing weekly reports in a spreadsheet and people building the models a business plans against. Pay follows that spread, which is why published averages for the title are unusually unhelpful.',
          'The useful question is not "what does a data analyst earn" but "what does this analyst own". Ownership of a decision is what is paid for.',
        ],
      },
      {
        heading: 'Typical ranges by level',
        bullets: [
          'Junior analyst (0–2 years): roughly $45,000–$65,000. Mostly reporting and data quality work.',
          'Analyst (2–4 years): roughly $60,000–$90,000. Owns a domain and its metrics.',
          'Senior analyst (4–7 years): roughly $85,000–$120,000. Sets definitions, is trusted in planning conversations.',
          'Analytics engineer: roughly $95,000–$140,000. Pays above pure analysis because the work is closer to production engineering.',
          'Analytics lead / manager: roughly $120,000–$165,000.',
        ],
      },
      {
        heading: 'Skills that shift you up a band',
        bullets: [
          'SQL beyond the basics — window functions, query plans, and knowing why a query is slow.',
          'Modelling and transformation tooling, which is the main bridge into analytics engineering.',
          'Experiment design. Analysts who can run and interpret a test properly are scarce.',
          'Communication. The best-paid analysts are the ones invited to the decision, not sent the request.',
          'Domain depth. Two years of finance or healthcare context is worth more than a fourth visualisation tool.',
        ],
      },
      {
        heading: 'Where the ceiling is',
        body: [
          'Generalist analysis flattens out at senior level in most organisations. The three routes past it are management, analytics engineering, or genuine specialisation — pricing, risk, experimentation, or a regulated domain.',
          'Choosing deliberately between those three at around the four-year mark is the difference between a career that keeps growing and one that plateaus at a comfortable but fixed number.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do I need a degree to become a data analyst?',
        answer:
          'Not usually. A portfolio of three real analyses, with the questions and the caveats written up clearly, gets more interviews than a certificate. Regulated sectors are the exception.',
      },
    ],
  },
  {
    slug: 'registered-nurse',
    kind: 'SALARY',
    title: 'Registered nurse salary guide',
    excerpt:
      'How nursing pay is structured, why shift differentials matter more than the headline rate, and what specialisation is worth.',
    category: 'Healthcare',
    tags: ['salary', 'nursing', 'healthcare'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Career development desk',
    readMinutes: 6,
    publishedAt: '2026-05-06',
    sections: [
      {
        heading: 'Nursing pay is structured, not negotiated',
        body: [
          'Unlike most commercial roles, nursing pay in public health systems is set by published bands tied to grade and years of service. There is usually little scope to negotiate the base rate, and a great deal of scope to change your effective earnings through grade progression, specialisation and shift pattern.',
          'That makes the useful analysis different: instead of researching a market rate, you are working out the fastest legitimate route up a defined ladder.',
        ],
      },
      {
        heading: 'What actually changes your earnings',
        bullets: [
          'Grade progression. Moving up a band is worth far more than any annual uplift.',
          'Shift differentials — nights, weekends and public holidays — which can add 15–30% for staff working unsocial patterns.',
          'Overtime and bank or agency shifts, paid at a premium but with no pension or leave attached.',
          'Specialisation: intensive care, theatre, neonatal and emergency roles usually attract additional payments.',
          'Location allowances in high cost-of-living areas.',
          'Private sector work, which often pays a higher base but with different pension and job security terms.',
        ],
      },
      {
        heading: 'Comparing offers properly',
        steps: [
          'Compare annual gross including expected differentials, not the hourly base rate.',
          'Value the pension. In public systems this is frequently worth more than a five-figure salary difference over a career.',
          'Count the leave entitlement and whether unsocial hours generate additional time off.',
          'Check the funded training and revalidation support — paying for your own courses is a real cost.',
          'Factor commute and parking, which are significant for shift work at unsociable hours.',
        ],
      },
      {
        heading: 'International moves',
        body: [
          'Nursing is one of the most portable professions, but registration is not automatic. Every destination requires verification of your qualification, language testing, and often a competency examination — a process that typically takes six to twelve months and costs money up front.',
          'Before comparing salaries across countries, price the registration route and check whether the employer sponsors it. A lower headline salary with sponsored registration and relocation frequently beats a higher one without.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does agency nursing pay better?',
        answer:
          'The hourly rate is higher, but it typically excludes pension, paid leave, sick pay and training. Calculate the annual equivalent including those before switching — many nurses find the gap much smaller than it first appears.',
      },
    ],
  },
]

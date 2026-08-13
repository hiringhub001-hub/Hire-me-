import type { ArticleSeed } from '@/content/posts/types'

export const careerArticles: ArticleSeed[] = [
  {
    slug: 'how-to-write-a-resume',
    kind: 'CAREER',
    title: 'How to write a resume that survives the first six seconds',
    excerpt:
      'A practical, section-by-section method for writing a CV that gets past automated screening and holds a recruiter’s attention long enough to earn a call.',
    category: 'Resume Writing',
    tags: ['resume', 'cv', 'job search', 'ats'],
    authorName: 'Dana Okoye',
    authorRole: 'Former in-house recruiter, 11 years',
    readMinutes: 9,
    publishedAt: '2026-03-04',
    sections: [
      {
        heading: 'What actually happens to your CV',
        body: [
          'Before a human reads your CV, two things usually happen to it. It is parsed by an applicant tracking system that turns your layout into plain text fields, and then it is skimmed by a recruiter who has forty of them open. The skim is short. Studies put it between six and eleven seconds, and my own experience screening for engineering and operations roles matches that: you are deciding whether to open the document properly, not reading it.',
          'That reality should shape every formatting decision you make. Anything that survives being flattened into text, and anything that answers "is this person plausibly right for the role" in the top third of page one, is worth keeping. Everything else is decoration.',
        ],
      },
      {
        heading: 'The structure that works',
        body: [
          'There is no single correct CV, but there is a reliable order. Put your name and contact details at the top, then a short professional summary, then experience in reverse chronological order, then skills, then education. Career changers and graduates can move education or a projects section above experience — everyone else should not.',
        ],
        steps: [
          'Header: name, city and country, phone, email, one link (LinkedIn or portfolio). No full street address, no date of birth, no photo unless it is the norm in your country.',
          'Summary: three lines, no more. Role, years of relevant experience, and one specific achievement with a number.',
          'Experience: most recent first. Company, title, dates, then three to five bullets per role.',
          'Skills: a short, honest list. Group by type if you have many.',
          'Education and certifications: qualification, institution, year. Recent graduates can add relevant coursework; nobody else should.',
        ],
      },
      {
        heading: 'Write bullets that mean something',
        body: [
          'The single biggest improvement most CVs need is turning duty statements into result statements. A duty statement describes what you were assigned. A result statement describes what changed because you were there.',
          'Compare "Responsible for social media accounts" with "Grew the company Instagram from 3,000 to 22,000 followers in 14 months, which became the second largest source of trial signups." The second sentence tells a hiring manager the scale you work at, the timeframe you think in, and that you understand what the business cares about.',
        ],
        bullets: [
          'Start every bullet with a verb in the past tense: built, negotiated, reduced, launched, trained.',
          'End with a number wherever one honestly exists — money, percentage, volume, time, headcount.',
          'If you cannot find a number, use a concrete outcome instead: a process that is now documented, an audit that passed, a client that renewed.',
          'Cut adjectives. "Highly motivated self-starter" costs a line and says nothing that can be verified.',
        ],
      },
      {
        heading: 'Getting through automated screening',
        body: [
          'Applicant tracking systems are less magical than people fear and more literal than people expect. They generally do not reject you outright. They index your document so a recruiter can search it, and if your CV does not contain the words the recruiter searches for, you are invisible.',
          'The fix is not keyword stuffing, which reads badly to the human at the end of the process. The fix is mirroring the language of the specific job advert where it is honestly true of you. If the advert says "accounts payable" and your CV says "supplier payments", add the phrase they used.',
        ],
        bullets: [
          'Use a single-column layout. Multi-column designs frequently parse in the wrong order.',
          'Avoid putting critical information in headers, footers, text boxes or images — parsers often drop them.',
          'Use standard section titles: Experience, Education, Skills. Creative headings confuse parsers and help nobody.',
          'Save as PDF unless the employer asks for .docx. Name the file yourself: Dana-Okoye-CV.pdf.',
          'Spell out acronyms once: "Search Engine Optimisation (SEO)". Recruiters search for both forms.',
        ],
      },
      {
        heading: 'Tailoring without rewriting from scratch',
        body: [
          'Tailoring every application sounds exhausting, and doing it badly is. The efficient method is to keep one master CV containing every bullet you have ever earned, then create each application by deleting and reordering rather than writing.',
          'Spend fifteen minutes per application: reorder your bullets so the three most relevant to that advert sit at the top of your most recent role, adjust your summary line to name the role you are applying for, and match two or three key phrases from the advert.',
        ],
        quote:
          'Fifteen minutes of tailoring beats an hour of writing a new CV, and it beats sending the same file to eighty employers by a wider margin still.',
      },
      {
        heading: 'Common mistakes that cost interviews',
        bullets: [
          'Unexplained gaps. A one-line, factual note — "Career break for caregiving, 2023–2024" — removes the question mark entirely.',
          'Three pages of history. Two pages is the ceiling for most people; one page if you have under five years of experience.',
          'A generic objective statement. "Seeking a challenging role in a dynamic organisation" is filler in every language.',
          'Listing every tool you have opened once. Anything on your CV is fair game in the interview.',
          'Typos in the first three lines. It is unfair how much weight this carries, and it carries it anyway. Read it aloud before sending.',
        ],
      },
      {
        heading: 'A ten-minute final check',
        steps: [
          'Read the top third of page one only. Would a stranger know what job you want and why you can do it?',
          'Count the numbers on the page. Fewer than three is a warning sign.',
          'Search the document for "responsible for" and rewrite every instance.',
          'Convert to PDF, then open the PDF and copy-paste it into a plain text editor. What you see is roughly what the parser sees.',
          'Ask one person who does not work in your field to read it. If they cannot tell what you do, neither can a recruiter screening outside their specialism.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How long should a resume be?',
        answer:
          'One page for under five years of experience, two pages beyond that. Three pages is only normal in academia, medicine and some senior public sector roles, where a longer CV with publications is expected.',
      },
      {
        question: 'Should I include a photo on my CV?',
        answer:
          'It depends entirely on the country. In the US, UK, Ireland, Canada and Australia, leave it off — employers often discard CVs with photos to reduce discrimination risk. In much of continental Europe, Latin America and parts of Asia, a professional headshot is standard.',
      },
      {
        question: 'Do I need a different CV for every job?',
        answer:
          'Not a different CV — a tailored version of the same one. Keep a master document, then reorder bullets and adjust the summary for each application. Fifteen minutes per role is enough.',
      },
      {
        question: 'What should I do about employment gaps?',
        answer:
          'State them briefly and factually, and move on. Gaps for study, caregiving, illness, redundancy or travel are common. Recruiters worry far more about unexplained gaps than explained ones.',
      },
    ],
  },
  {
    slug: 'how-to-negotiate-salary',
    kind: 'CAREER',
    title: 'How to negotiate salary without losing the offer',
    excerpt:
      'What to say when you are asked for your expectations, how to counter an offer in writing, and the four things besides base pay that are usually easier to move.',
    category: 'Salary Negotiation',
    tags: ['salary', 'negotiation', 'offers'],
    authorName: 'Marcus Lin',
    authorRole: 'Compensation consultant',
    readMinutes: 8,
    publishedAt: '2026-02-18',
    sections: [
      {
        heading: 'The offer is not the ceiling, and asking is not rude',
        body: [
          'Most candidates accept the first number they are given. Most employers expect one round of negotiation and build a little room into the offer for exactly that. The gap between those two facts is where a lot of money quietly goes missing over a career, because every future raise, bonus and pension contribution is calculated from the base you started at.',
          'Negotiating politely and once has almost never cost anyone an offer in my experience. Offers get withdrawn when a candidate is aggressive, negotiates repeatedly after agreeing, or invents a competing offer that does not exist. Those are avoidable behaviours, not risks inherent to asking.',
        ],
      },
      {
        heading: 'Before you talk to anyone, decide three numbers',
        steps: [
          'Your walk-away: the figure below which you would decline and keep looking. Be honest, and account for your actual costs.',
          'Your target: what the role is genuinely worth in that market for someone with your evidence. Research it, do not guess.',
          'Your ask: slightly above your target, so the midpoint of any negotiation lands where you want to be.',
        ],
        body: [
          'Write these down before the first call. The purpose is not to be rigid; it is that you will be asked for a number at an inconvenient moment, and improvising under pressure reliably produces a lower figure than reasoning in advance.',
        ],
      },
      {
        heading: 'When they ask for your expectations first',
        body: [
          'The person asking is usually a recruiter trying to avoid wasting everyone\'s time, not laying a trap. You have three reasonable responses, in order of preference.',
        ],
        bullets: [
          'Deflect once, politely: "I would rather understand the scope first — do you have a band for the role?" Many employers will simply tell you, and in a growing number of places they are legally required to.',
          'If they press, give a range whose lower bound you would genuinely accept: "Based on what I have seen for similar roles, I am looking at 65,000 to 75,000." Never name a bottom number you would resent.',
          'Never state your current salary if you can avoid it, and in several jurisdictions they cannot ask. Anchor on the market value of the role, not on your history.',
        ],
      },
      {
        heading: 'How to counter an offer',
        body: [
          'Counter in writing, by email, within a day or two. Writing gives you time to phrase it well and gives them something forwardable to whoever approves the budget.',
          'A counter has four parts and fits in six sentences: enthusiasm, a specific number, a justification anchored in value, and a clear signal that you want to close.',
        ],
        quote:
          '"Thank you — I am genuinely pleased and I want to accept. Based on the scope we discussed and comparable roles at this level, I was hoping for 78,000. If you can meet that, I am ready to sign this week."',
      },
      {
        heading: 'What is easier to move than base salary',
        body: [
          'Base pay is often locked to an internal band that your hiring manager cannot exceed without approval. When you hear a firm no on salary, that is usually true rather than a tactic — and it is exactly the moment to ask about the things that sit outside the band.',
        ],
        bullets: [
          'A signing bonus. One-off costs are easier to approve than permanent ones.',
          'An early review. "Would you agree to a compensation review at six months against agreed objectives?" Get it in the contract, not in conversation.',
          'Annual leave. Often the single most valuable thing you can win, and frequently discretionary.',
          'Remote or flexible days, which have direct financial value in commuting costs and time.',
          'A training budget, professional membership fees, or equipment.',
          'Start date. An extra two weeks unpaid but rested has real value.',
        ],
      },
      {
        heading: 'Mistakes that do cost offers',
        bullets: [
          'Negotiating again after you have agreed a number. This reads as bad faith and is the most common reason offers are pulled.',
          'Inventing a competing offer. It is checked more often than people think, and the sector is small.',
          'Justifying your ask with personal need — rent, a new baby, debt. It is human, but it argues from your costs rather than your value.',
          'Going silent for a week to seem in demand. It reads as disorganised.',
          'Accepting verbally and continuing to interview elsewhere without saying so.',
        ],
      },
      {
        heading: 'Get it in writing before you resign',
        body: [
          'Do not hand in a notice period against a verbal offer, however warm the conversation was. Wait for the written contract, check that the base, bonus terms, start date, leave and job title match what you agreed, and query anything that does not before you sign.',
          'If a background or reference check is a condition, note that too — a conditional offer is not the same as a confirmed one.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is it safe to negotiate a first job offer?',
        answer:
          'Yes, if you do it once and politely. Entry-level bands are usually tighter, so expect a smaller movement — but a signing bonus, start date or training budget is often available even when base pay is fixed.',
      },
      {
        question: 'What if they ask for my current salary?',
        answer:
          'In several countries and US states it is unlawful to ask. Elsewhere you can redirect: "I would rather focus on the market rate for this role — my expectation is X." You are not obliged to disclose it.',
      },
      {
        question: 'How much more should I ask for?',
        answer:
          'Ten to twenty percent above the offer is a normal ask when the offer is below market. If the offer already sits at the top of the researched band, negotiate on non-salary terms instead.',
      },
    ],
  },
  {
    slug: 'career-change-guide',
    kind: 'CAREER',
    title: 'Changing careers: a realistic plan for the first twelve months',
    excerpt:
      'How to move into a new field without starting from zero — auditing transferable skills, closing the credibility gap, and budgeting for the transition.',
    category: 'Career Growth',
    tags: ['career change', 'planning', 'skills'],
    authorName: 'Priya Raman',
    authorRole: 'Career coach',
    readMinutes: 10,
    publishedAt: '2026-01-22',
    sections: [
      {
        heading: 'Start with a diagnosis, not a destination',
        body: [
          'People usually arrive at a career change with a job title in mind. That is the wrong end to start from, because the title is a guess at a solution to a problem you have not yet stated precisely.',
          'Spend a week writing down, at the end of each day, which tasks energised you and which drained you. Not which projects — which tasks. The pattern that emerges is far more useful than a title, because it transfers across industries.',
          'Often the diagnosis reveals that the job is not the problem. A change of team, manager or scope inside your current employer is dramatically cheaper than a career change, and it is worth ruling out honestly before committing to two years of transition.',
        ],
      },
      {
        heading: 'Audit what actually transfers',
        body: [
          'Most people undersell their transferable skills because they describe them in the vocabulary of their old industry. A teacher who has run a department has budget ownership, stakeholder management, performance management and public speaking under pressure. A nurse has triage under time constraint, documentation discipline and de-escalation.',
        ],
        bullets: [
          'List every task you do in a month, then mark each one as domain-specific or general.',
          'Rewrite the general ones in neutral business language, without your industry\'s jargon.',
          'For each, find one example with a number attached. This becomes CV material.',
          'What is left over — the genuinely domain-specific items — is your skills gap. That list should be short and specific.',
        ],
      },
      {
        heading: 'Close the credibility gap before you apply',
        body: [
          'The obstacle in a career change is rarely capability. It is that a hiring manager has to take a risk on someone with no track record in the field, and they usually have applicants who do have one. Your job in the first six months is to remove that risk cheaply.',
          'Evidence beats intent every time. A certificate says you attended; a piece of work says you can do it. Wherever you can choose, choose the thing that produces an artefact someone can look at.',
        ],
        steps: [
          'Pick one credential only if it is genuinely a gatekeeper in your target field. Many are not.',
          'Produce three pieces of real work — a freelance project, a volunteer engagement, an internal project at your current employer, or a well-documented personal build.',
          'Get one person in the field to review your work and tell you honestly where it falls short of professional standard. Then fix it.',
          'Write publicly about what you learned. It is the cheapest credibility available and it makes you findable.',
          'Have fifteen conversations with people doing the job. Ask what the worst part of it is; the answers are more informative than any careers guide.',
        ],
      },
      {
        heading: 'The bridge role',
        body: [
          'The most reliable career changes happen in two hops rather than one. A bridge role uses your existing domain knowledge in your target function, or your existing function in your target domain — and it is far easier to get than a straight jump.',
          'A pharmacist moving into product management joins a healthcare software company, where the pharmacy knowledge is an asset rather than an irrelevance. A logistics coordinator moving into data analysis first becomes the analyst for a logistics team.',
        ],
        quote:
          'One hop of forty-five degrees, twice, is far easier than one hop of ninety — and it usually costs you less money.',
      },
      {
        heading: 'Budget for it honestly',
        body: [
          'Career changes cost money in two ways: direct costs of retraining, and the pay dip that often comes with entering a field at a lower level. Pretending otherwise is how transitions get abandoned at month eight.',
        ],
        bullets: [
          'Work out your minimum monthly requirement, not your current spending.',
          'Assume the search takes three to six months longer than a like-for-like move.',
          'Prefer transitions you can fund from employment. Quitting to study full-time is the highest-risk version and is rarely necessary.',
          'Treat a pay dip as an investment with a payback period, and estimate that period. If it is more than three years, reconsider the route rather than the goal.',
        ],
      },
      {
        heading: 'How to talk about it in interviews',
        body: [
          'You will be asked why you are changing. The answer needs to be short, forward-looking and free of complaint about your old field. Interviewers are listening for whether this is a considered move towards something or an escape from something.',
          'A structure that works: what you learned you were good at, what you did about it, and why this specific role is the right place to apply it. Sixty seconds, then stop talking.',
        ],
      },
      {
        heading: 'A twelve-month shape',
        steps: [
          'Months 1–2: diagnosis, skills audit, and fifteen conversations.',
          'Months 3–6: close the specific gap; produce three artefacts; start writing publicly.',
          'Months 6–9: apply for bridge roles; expect a low response rate and treat each application as a test of your positioning.',
          'Months 9–12: convert. Take the role that gives you the title and the reference, even if the salary is not yet where you want it.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Am I too old to change careers?',
        answer:
          'Experience is an asset in most fields if you position it as transferable rather than as time served. The practical constraints tend to be financial rather than about age — plan the money, and the move is usually feasible.',
      },
      {
        question: 'Do I need a degree in the new field?',
        answer:
          'Only where it is a legal or licensing requirement — medicine, law, engineering sign-off, teaching in many systems. In most commercial fields, demonstrable work outperforms a second degree and costs far less.',
      },
    ],
  },
  {
    slug: 'remote-work-guide',
    kind: 'CAREER',
    title: 'Finding and keeping a genuinely remote job',
    excerpt:
      'How to filter real remote roles from disguised hybrid ones, what employers screen for in remote hiring, and the habits that make remote work sustainable.',
    category: 'Remote Work',
    tags: ['remote', 'work from home', 'job search'],
    authorName: 'Dana Okoye',
    authorRole: 'Former in-house recruiter, 11 years',
    readMinutes: 8,
    publishedAt: '2026-04-09',
    sections: [
      {
        heading: 'Not every "remote" job is remote',
        body: [
          'The word has been stretched to cover at least four arrangements, and the difference matters enormously to your life. Before applying, work out which one you are looking at, because the advert often will not tell you plainly.',
        ],
        bullets: [
          'Fully remote, hire anywhere: rare, usually needs an employer of record in your country.',
          'Remote within a country or region: the most common genuine remote role.',
          'Remote with mandatory travel: a few days on site per quarter. Reasonable, but budget the time.',
          'Hybrid described as remote: two or three office days per week. Check for the phrase "remote-first" versus "remote-friendly", and ask directly at screening.',
        ],
      },
      {
        heading: 'What remote employers screen for',
        body: [
          'Remote hiring filters on a different axis from office hiring. The manager cannot see you working, so they are assessing whether your work will be visible without supervision. Three signals carry most of the weight.',
        ],
        steps: [
          'Written communication. Your application is the first sample. A clear, well-structured cover note is disproportionately powerful here.',
          'Evidence of self-direction. Concrete examples where you set your own priorities and reported on them.',
          'Overlap and reliability. State your time zone and your working hours explicitly — many applications are rejected simply because the recruiter could not tell.',
        ],
      },
      {
        heading: 'Questions worth asking before you accept',
        bullets: [
          'How many hours of overlap with the core team are expected, and with which time zone?',
          'Which country will I be employed in, and by which entity? This determines your tax and benefits.',
          'Is there an equipment or home office budget?',
          'How is performance measured for remote staff specifically?',
          'How often does the team meet in person, and who pays for travel?',
          'What happens to the arrangement if the company changes its policy? Ask for the remote terms in the contract, not the handbook.',
        ],
      },
      {
        heading: 'Making it sustainable',
        body: [
          'The failure mode of remote work is not laziness — it is the opposite. Without a commute to mark the boundary, work expands, and the people who struggle after a year are usually those who never built one.',
        ],
        bullets: [
          'Create a start and end ritual. A walk before and after the working day does more than any productivity app.',
          'Work somewhere that is not where you relax, even if that is a different chair.',
          'Over-communicate progress. A short written update beats being online at odd hours.',
          'Book social contact deliberately. Isolation is the most commonly reported downside in every survey on the subject.',
          'Take your annual leave properly, and be off when you are off.',
        ],
      },
      {
        heading: 'Spotting remote job scams',
        body: [
          'Remote hiring attracts a specific set of frauds, and they follow a recognisable pattern. CareerHub removes listings that show these signs, but you will meet them elsewhere, so the pattern is worth knowing.',
        ],
        bullets: [
          'Any request for payment — for training, equipment, or a background check. Legitimate employers never charge candidates.',
          'An offer made without a real interview, often over chat only.',
          'A cheque sent to you to buy equipment. This is a well-known fraud; the cheque bounces after you have sent the money on.',
          'Requests for bank details or identity documents before a written contract exists.',
          'Contact only from a free email domain, or a company with no verifiable presence.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I work remotely for a company in another country?',
        answer:
          'Sometimes, but it depends on employment law and tax rather than willingness. The company needs a legal entity or an employer-of-record in your country, or must engage you as a contractor. Ask which arrangement applies before accepting.',
      },
      {
        question: 'Do remote jobs pay less?',
        answer:
          'Some employers apply location-based bands, others pay a single rate. Ask early whether pay is location-adjusted — it is a normal question and the answer varies enormously between companies.',
      },
    ],
  },
  {
    slug: 'first-90-days-in-a-new-job',
    kind: 'CAREER',
    title: 'Your first 90 days in a new job',
    excerpt:
      'A week-by-week plan for starting well: what to learn, what to change, and the one mistake that damages a new starter’s reputation fastest.',
    category: 'Career Growth',
    tags: ['onboarding', 'new job', 'career growth'],
    authorName: 'Priya Raman',
    authorRole: 'Career coach',
    readMinutes: 7,
    publishedAt: '2026-05-13',
    sections: [
      {
        heading: 'The reputation you get in week two is hard to change in year two',
        body: [
          'People form a working impression of a new colleague very quickly, and that impression is durable. It is built almost entirely from small things: whether you turned up prepared, whether you asked good questions, whether you did what you said you would by the day you said it.',
          'None of this requires you to deliver a major result in month one. It requires you to be legible and reliable while you learn.',
        ],
      },
      {
        heading: 'Days 1–30: learn the system, change nothing',
        bullets: [
          'Meet everyone your work touches, one to one, for twenty-five minutes. Ask what they need from your role, and what has frustrated them about it previously.',
          'Write down every question you cannot answer. Answering your own list is your curriculum.',
          'Find the actual process, not the documented one. They differ everywhere, and the gap is usually where the useful work is.',
          'Confirm what success looks like with your manager, in writing, in the first fortnight. "What does good look like at 90 days?" is the highest-value question you will ask all quarter.',
          'Resist the urge to announce how it was done at your last employer. This is the single fastest way to lose goodwill.',
        ],
      },
      {
        heading: 'Days 31–60: deliver something small and visible',
        body: [
          'By the second month you should be looking for a piece of work that is genuinely useful, finishable within a few weeks, and visible to people beyond your immediate team. It does not need to be strategic. Fixing a report everyone complains about earns more credibility than a well-argued proposal for something bigger.',
          'The purpose is to convert the goodwill of arrival into a track record. Once you have shipped one thing, your opinions on larger things carry weight.',
        ],
      },
      {
        heading: 'Days 61–90: propose, then agree the next quarter',
        steps: [
          'Write a short document: what you have learned, what you have delivered, and the two or three things you believe are worth changing.',
          'Share it with your manager before anyone else. Being surprised in public is the thing managers like least.',
          'Agree a concrete plan for the next quarter with dates attached.',
          'Ask directly for feedback on how you are landing with the team. Ask twice — the second answer is usually the honest one.',
        ],
      },
      {
        heading: 'If it is going badly',
        body: [
          'Sometimes the job is not what was described, or the manager is not what the interview suggested. Raising it early, factually and without ultimatum is far more effective than enduring it silently until you resign.',
          'Describe the gap between what was agreed and what is happening, ask what can change, and set yourself a date to reassess. If nothing has moved by that date, start looking — quietly, and without burning the reference.',
        ],
      },
    ],
  },
]

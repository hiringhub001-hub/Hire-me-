import type { ArticleSeed } from '@/content/posts/types'

export const blogArticles: ArticleSeed[] = [
  {
    slug: 'how-to-spot-a-job-scam',
    kind: 'BLOG',
    title: 'How to spot a job scam before it costs you',
    excerpt:
      'Recruitment fraud has become more sophisticated and better written. Here are the patterns that still give it away, and what to do if you have already engaged.',
    category: 'Job Search',
    tags: ['scams', 'safety', 'job search'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Hiring and recruitment desk',
    readMinutes: 7,
    publishedAt: '2026-05-28',
    sections: [
      {
        heading: 'The economics of a job scam',
        body: [
          'Understanding what the fraudster wants makes the patterns obvious. There are only three things worth stealing from a job applicant: money, identity documents, and access to your bank account for moving other people\'s money.',
          'Every scam is therefore a route to one of those three. If you ask yourself, at each step, "which of the three is this heading towards", the pitch usually becomes transparent well before any harm is done.',
        ],
      },
      {
        heading: 'Signals that should stop you immediately',
        bullets: [
          'Any request for payment. Training fees, equipment deposits, background check costs, visa processing. Legitimate employers pay for all of these.',
          'A job offer without a real interview, or an interview conducted entirely over a messaging app.',
          'Being sent a cheque or transfer to buy your own equipment. The payment is later reversed and the money you forwarded is gone.',
          'A request for bank details, national identity numbers or copies of your passport before a written contract exists.',
          'Correspondence from a free email address using a company name, or a domain registered a few weeks ago.',
          'Pressure to decide immediately, or a warning not to discuss the offer with anyone.',
        ],
      },
      {
        heading: 'Softer signals worth checking',
        body: [
          'Not every warning sign is conclusive. Small employers do sometimes interview quickly, and legitimate roles occasionally have vague adverts. Treat the following as prompts to verify rather than to walk away.',
        ],
        bullets: [
          'A salary far above the market rate for the described work.',
          'A job description with no specific duties — "flexible tasks, work from home, immediate start".',
          'A company with a website but no traceable staff, address or registration.',
          'A recruiter who cannot name the client, or names one that has no such vacancy.',
          'Interview questions that focus on your finances rather than your ability.',
        ],
      },
      {
        heading: 'How to verify in five minutes',
        steps: [
          'Search the company name plus the word "scam" or "review".',
          'Look up the company in the national companies register. Registration is not proof of legitimacy, but absence is meaningful.',
          'Find the vacancy on the employer\'s own careers page. If it is not there, contact them through details you found yourself — never through the ones in the email.',
          'Check the recruiter\'s professional profile for history and mutual connections.',
          'Check that the email domain matches the company domain exactly. Look closely for substituted characters.',
        ],
      },
      {
        heading: 'If you have already engaged',
        bullets: [
          'Stop all contact and do not send further documents or money.',
          'If you sent bank details, call your bank immediately and tell them it was fraud.',
          'If you sent identity documents, report it to your national identity-theft or fraud reporting service and consider a credit freeze.',
          'Report the listing to whichever platform hosted it, so it can be removed for everyone else.',
          'Do not be embarrassed into silence. These operations are professional, they target people under financial pressure, and reporting is what shortens their lifespan.',
        ],
      },
      {
        heading: 'What we do about it here',
        body: [
          'CareerHub reviews employer accounts before their listings go live, removes any listing that asks candidates for payment, and never charges job seekers for anything. Listings sourced from partner boards carry a badge showing where they came from and link to the employer\'s own application page, so you can always see where your details are going.',
          'If you see something on this site that looks wrong, please report it through the contact page. We would rather review a hundred false alarms than leave one fraudulent listing up.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should a recruiter ever ask for my bank details?',
        answer:
          'Only after you have accepted a written offer and are being set up on payroll — and even then, through an official HR system rather than by email. Before that point, there is no legitimate reason to need them.',
      },
      {
        question: 'Are job scams more common in remote work?',
        answer:
          'Yes. Remote hiring is a natural cover for never meeting anyone, and the volume of applicants is high. Apply the same verification steps regardless of how the role is advertised.',
      },
    ],
  },
  {
    slug: 'applying-to-jobs-on-linkedin-and-indeed',
    kind: 'BLOG',
    title: 'Applying through LinkedIn, Indeed and aggregators without losing track',
    excerpt:
      'Job hunting now means applying across half a dozen platforms. Here is a system for tracking applications, avoiding duplicates, and following up at the right time.',
    category: 'Job Search',
    tags: ['job search', 'linkedin', 'indeed', 'organisation'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Career development desk',
    readMinutes: 6,
    publishedAt: '2026-06-10',
    sections: [
      {
        heading: 'Why the same job appears in six places',
        body: [
          'When an employer posts a vacancy, it usually goes to their own careers page first. From there it is syndicated — automatically or by a recruiter — to the large boards, to aggregators that index those boards, and to niche sites for the sector.',
          'The result is that one vacancy can appear under slightly different titles across many sites. That is not deception; it is how the market distributes listings. But it does mean a job seeker can easily apply to the same role twice through different routes, which looks disorganised to the employer.',
        ],
      },
      {
        heading: 'Apply once, through the shortest route',
        body: [
          'Wherever you find a role, check the employer\'s own careers page before applying. Applying directly is usually the shortest path to a human, and it avoids your application sitting in an inbox nobody has claimed.',
          'Where the employer takes applications on a specific platform, use that platform. On CareerHub, listings sourced from partner boards say so plainly and send you to the employer\'s own application page there, so you always know where you are applying.',
        ],
      },
      {
        heading: 'A tracking system that takes two minutes a day',
        steps: [
          'Keep one list — a spreadsheet is fine — with: company, role, source, date applied, application route, contact name, status, and the date you will follow up.',
          'Save the job advert text when you apply. Listings are removed, and you will want it before an interview.',
          'Record which CV version you sent. Being asked about a bullet you cannot remember writing is avoidable.',
          'Set the follow-up date at ten working days when you log the application, not later.',
          'Review the whole list once a week and close out anything dead, so the list reflects reality.',
        ],
      },
      {
        heading: 'Following up without being a nuisance',
        body: [
          'One follow-up after ten working days is professional and is not held against you. A second after a further two weeks is acceptable. Beyond that, treat silence as an answer and spend the energy on new applications.',
          'Keep it to three sentences: the role and date you applied, one line of continued interest with a specific reason, and a question about the timeline.',
        ],
      },
      {
        heading: 'Quality still beats volume',
        body: [
          'The temptation with one-click applications is to send a hundred. The data from every recruiter I have worked with points the same way: twenty tailored applications outperform two hundred generic ones, and they take less total time once you account for the interviews you actually convert.',
          'A reasonable weekly target for someone searching seriously is eight to twelve applications, each with a CV reordered for the advert and a short, specific cover note.',
        ],
      },
    ],
  },
  {
    slug: 'ats-friendly-cv-formatting',
    kind: 'BLOG',
    title: 'ATS-friendly CV formatting: what actually matters',
    excerpt:
      'Applicant tracking systems are widely misunderstood. Here is what they really do to your document, and the small number of formatting rules that follow from it.',
    category: 'Resume Writing',
    tags: ['ats', 'resume', 'formatting'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Technical hiring desk',
    readMinutes: 6,
    publishedAt: '2026-06-24',
    sections: [
      {
        heading: 'What an ATS is, and what it is not',
        body: [
          'An applicant tracking system is a database with a workflow attached. It stores applications, lets recruiters search and filter them, and tracks each candidate through stages. That is the whole of it.',
          'It is not an artificial intelligence that scores your personality, and in the overwhelming majority of configurations it does not automatically reject you. The mechanism people are actually worried about is simpler: if the system parses your document badly, the recruiter searching it will not find you.',
        ],
      },
      {
        heading: 'The formatting rules that follow',
        bullets: [
          'One column. Two-column layouts frequently parse out of order, interleaving your job titles with your skills.',
          'Standard section headings — Experience, Education, Skills. Parsers look for these strings.',
          'No critical content in headers, footers, text boxes, tables or images. Contact details in a header is the classic mistake.',
          'Real bullet characters, not images or unusual glyphs.',
          'A common font. Decorative fonts sometimes parse as gibberish.',
          'Dates in a consistent format, ideally "Mar 2022 – Jun 2024". Parsers use these to calculate your years of experience.',
          'PDF unless the employer specifies otherwise, and never a scanned image of a document.',
        ],
      },
      {
        heading: 'The keyword question, honestly',
        body: [
          'Recruiters search the database with the terms from the job description. If the advert says "accounts receivable" and you wrote "customer invoicing", you will not appear in that search — not because you were rejected, but because you were never returned.',
          'So mirror the advert\'s vocabulary where it is truthfully yours. What does not work is stuffing: hidden white text, a keyword list at the bottom, or repeating a term twenty times. Modern systems flag it, and a human reads the document eventually.',
        ],
      },
      {
        heading: 'Test it yourself in one minute',
        steps: [
          'Open your PDF and select all the text, then paste it into a plain text editor.',
          'Read what appears. If sections are jumbled, or your contact details are missing, that is roughly what the parser sees.',
          'Check that your job titles, employers and dates are all present and in order.',
          'Fix the layout until the pasted text reads correctly, then stop. That is the whole of ATS optimisation.',
        ],
      },
      {
        heading: 'What matters far more',
        body: [
          'Once you are past parsing, formatting stops mattering and content takes over. A perfectly parsed CV full of duty statements loses to a slightly imperfect one full of results.',
          'Spend twenty minutes on formatting, once. Spend the rest of your time on the bullets.',
        ],
      },
    ],
  },
]

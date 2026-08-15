import type { ArticleSeed } from '@/content/posts/types'

export const interviewArticles: ArticleSeed[] = [
  {
    slug: 'frontend-developer',
    kind: 'INTERVIEW',
    title: 'Frontend developer interview guide',
    excerpt:
      'The five stages of a typical frontend hiring process, the questions that actually get asked, and how to prepare for each without memorising trivia.',
    category: 'Technology',
    tags: ['interview', 'frontend', 'react', 'javascript'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Technical hiring desk',
    readMinutes: 11,
    publishedAt: '2026-03-19',
    sections: [
      {
        heading: 'What the process usually looks like',
        body: [
          'Frontend processes vary, but most companies run some version of the same five stages. Knowing which stage you are at tells you what is being assessed, which is more useful than a list of questions.',
        ],
        steps: [
          'Recruiter screen (20–30 minutes): motivation, salary expectations, notice period, and a sanity check on your experience.',
          'Technical screen (45–60 minutes): a small coding exercise, often in a shared editor, or a discussion of your past work.',
          'Take-home or live build (1–4 hours): build a small feature. This is the stage that most often decides the outcome.',
          'System and craft discussion (60 minutes): component architecture, state management, performance, accessibility.',
          'Team and values conversation: how you collaborate, handle disagreement, and give feedback.',
        ],
      },
      {
        heading: 'JavaScript questions you should be able to answer cold',
        bullets: [
          'What is the difference between == and ===, and when would you deliberately use the loose one?',
          'Explain closures with an example from real code, not a counter function.',
          'What does the event loop do with a promise versus a setTimeout callback, and in what order do they run?',
          'How does prototypal inheritance differ from classical inheritance?',
          'What are the practical differences between var, let and const in a loop?',
          'What is event delegation, and why does it matter for a list of a thousand rows?',
          'How would you deep clone an object, and what breaks with JSON.parse(JSON.stringify(x))?',
        ],
        body: [
          'Interviewers are not testing recall. They are testing whether you have debugged something with these mechanics involved. Answer with the concept, then immediately give a case where it bit you.',
        ],
      },
      {
        heading: 'React questions and what a good answer contains',
        bullets: [
          'When does a component re-render, and how do you find out why one did? A good answer mentions profiling before optimising.',
          'What problem do keys solve in a list, and what goes wrong with array indices as keys?',
          'When would you reach for context, and when is it the wrong tool? Look for an answer that mentions re-render scope.',
          'How do you handle data fetching, loading and error states? Strong candidates mention what the user sees during each.',
          'What is the difference between server and client components, and what determines which you choose?',
          'How do you test a component? The expected answer is testing behaviour a user can observe, not implementation details.',
        ],
      },
      {
        heading: 'CSS and accessibility — where most candidates lose points',
        body: [
          'Frontend candidates routinely prepare JavaScript thoroughly and CSS not at all, then meet a layout question in the live exercise. Accessibility is the same story, and it is increasingly a hard requirement rather than a bonus.',
        ],
        bullets: [
          'Be able to build a responsive layout with flexbox and grid without looking anything up.',
          'Understand the cascade, specificity and stacking contexts well enough to debug someone else\'s stylesheet.',
          'Know what semantic HTML buys you: a button is focusable, keyboard-activatable and announced correctly; a div with an onClick is none of those.',
          'Be able to explain focus management in a modal, why aria-label is a last resort, and what a visible focus indicator is for.',
          'Know how to check colour contrast and roughly what the thresholds are.',
        ],
      },
      {
        heading: 'The take-home exercise',
        body: [
          'This stage is where offers are won and lost, and the differentiator is rarely cleverness. Reviewers are looking for code they would be happy to maintain.',
        ],
        steps: [
          'Read the brief twice and write down the acceptance criteria before opening an editor.',
          'Commit in small, meaningful steps. Reviewers read the history.',
          'Handle the unglamorous states: empty, loading, error, and long text that breaks the layout.',
          'Write a README explaining your decisions, what you would do with more time, and what you deliberately left out. This single file changes reviewer perception more than any feature.',
          'Include a few tests of behaviour. Two good tests beat twenty shallow ones.',
          'Respect the stated time budget and say what you spent. Going far over is not a positive signal.',
        ],
      },
      {
        heading: 'Behavioural questions in a technical interview',
        bullets: [
          'Tell me about a technical decision you got wrong. What did it cost, and how did you find out?',
          'Describe a disagreement with a designer or product manager and how it resolved.',
          'What is the hardest bug you have debugged? Interviewers want method, not heroics.',
          'How do you handle a code review comment you disagree with?',
          'Tell me about something you shipped that users noticed.',
        ],
        body: [
          'Use STAR — situation, task, action, result — and keep each answer under two minutes. Prepare three stories that can be reshaped to fit most questions rather than trying to have one per question.',
        ],
      },
      {
        heading: 'Questions to ask them',
        bullets: [
          'What does the first 90 days look like for this role?',
          'How does work get from idea to production here, and how long does that usually take?',
          'What is the test and review culture like? Who reviews frontend work?',
          'What is the most frustrating part of the codebase right now?',
          'How is the team measured, and by whom?',
        ],
      },
    ],
    faqs: [
      {
        question: 'How long should I prepare for a frontend interview?',
        answer:
          'Two focused weeks is enough for most people already working in the field: a few days on JavaScript mechanics, a few on React patterns, one on CSS and accessibility, and the rest on rehearsing behavioural answers out loud.',
      },
      {
        question: 'Are take-home exercises still common?',
        answer:
          'Yes, though many companies now cap them at two to four hours or replace them with a paired live build. If a take-home looks like unpaid production work rather than an exercise, it is reasonable to ask about scope.',
      },
      {
        question: 'Should I use AI tools during a take-home?',
        answer:
          'Ask. Policies differ sharply and the honest answer is respected; being caught after saying otherwise is not. Where it is allowed, you are still expected to explain and defend every line.',
      },
    ],
  },
  {
    slug: 'behavioural-interview-questions',
    kind: 'INTERVIEW',
    title: 'Behavioural interview questions: how to answer the 12 that keep coming up',
    excerpt:
      'The STAR method applied properly, with worked answers to the questions that appear in almost every interview regardless of industry.',
    category: 'Interview Preparation',
    tags: ['interview', 'star method', 'behavioural'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Hiring and recruitment desk',
    readMinutes: 9,
    publishedAt: '2026-02-05',
    sections: [
      {
        heading: 'Why these questions exist',
        body: [
          'Behavioural questions rest on a simple premise: how you handled a situation before predicts how you will handle it again. That premise is imperfect, but it is more reliable than asking what someone would hypothetically do, which mostly tests imagination.',
          'The practical consequence is that hypothetical answers score badly. "I would always make sure to communicate clearly" is worth almost nothing. "Here is when I did not, and what it cost" is worth a great deal.',
        ],
      },
      {
        heading: 'STAR, done properly',
        body: [
          'Most candidates know the acronym and still use it badly, usually by spending 80% of the answer on context and running out of time before the result.',
        ],
        bullets: [
          'Situation — two sentences maximum. Enough for the interviewer to picture it, no more.',
          'Task — one sentence. What were you specifically responsible for?',
          'Action — the bulk of the answer, and it must be in the first person singular. "We" hides your contribution.',
          'Result — always include one, with a number or a concrete consequence, and where relevant what you learned.',
        ],
        quote:
          'Aim for ninety seconds to two minutes. If the interviewer wants more they will ask, and being asked a follow-up is a good sign.',
      },
      {
        heading: 'The twelve questions',
        steps: [
          'Tell me about yourself. — Not a biography. Present role, one relevant achievement, why you are here.',
          'Why do you want this job? — Something specific about the role or company. Generic enthusiasm is a negative signal.',
          'Tell me about a time you failed. — Pick a real failure with a real cost, and spend most of the answer on what changed afterwards.',
          'Describe a conflict with a colleague. — Show that you separated the person from the problem. Never disparage anyone.',
          'Tell me about a time you had to work to a tight deadline. — Focus on how you decided what to cut.',
          'Give an example of when you influenced without authority. — Interviewers love this one; prepare it.',
          'Tell me about receiving difficult feedback. — What did you actually change?',
          'Describe a time you had to learn something quickly. — Method, not just outcome.',
          'Tell me about a decision you made with incomplete information.',
          'When have you disagreed with a manager? — Show the disagree-and-commit pattern.',
          'What is your greatest weakness? — Something real, plus the mitigation you have built. Not a disguised strength.',
          'Where do you see yourself in five years? — Direction, not a title. Show that this role is a plausible step towards it.',
        ],
      },
      {
        heading: 'Build a story bank, not twelve answers',
        body: [
          'Trying to prepare a separate answer for every possible question is exhausting and produces rigid, recited responses. Instead prepare six strong stories from your career and practise reframing each one.',
          'A single project where you rescued a slipping deadline can answer questions about pressure, prioritisation, conflict, influence and failure — depending on which part you foreground.',
        ],
        bullets: [
          'A project you delivered under real constraint.',
          'A failure with a measurable cost.',
          'A conflict you resolved.',
          'A time you changed someone\'s mind.',
          'Something you taught yourself under time pressure.',
          'A moment you improved how the team works, not just what it produced.',
        ],
      },
      {
        heading: 'Delivery matters more than people expect',
        bullets: [
          'Practise aloud. Answers that read well silently often collapse when spoken.',
          'Record yourself once. Painful, effective.',
          'Pause before answering. Two seconds of thought reads as considered, not slow.',
          'Ask for clarification if the question is vague — that is assessed positively.',
          'If you blank, say so and come back to it. Interviewers are far more forgiving of that than of a rambling non-answer.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What if I do not have a relevant example?',
        answer:
          'Use an example from outside paid work — study, volunteering, a side project, a community role. Say where it comes from. An honest adjacent example beats an invented one, which follow-up questions expose quickly.',
      },
      {
        question: 'How honest should I be about a failure?',
        answer:
          'Genuinely honest about the failure, and specific about what changed as a result. Avoid failures that suggest a values problem — dishonesty, or blaming others. A missed deadline you learned from is ideal material.',
      },
    ],
  },
  {
    slug: 'customer-service-representative',
    kind: 'INTERVIEW',
    title: 'Customer service interview guide',
    excerpt:
      'Role-play scenarios, the metrics you will be asked about, and how to answer the difficult-customer question without sounding rehearsed.',
    category: 'Customer Support',
    tags: ['interview', 'customer service', 'support'],
    authorName: 'CareerHub Editorial Team',
    authorRole: 'Pay and compensation desk',
    readMinutes: 7,
    publishedAt: '2026-04-27',
    sections: [
      {
        heading: 'What the process looks like',
        body: [
          'Customer service hiring is fast, usually two or three stages, and it leans heavily on role play. Employers are assessing tone under pressure more than knowledge, because product knowledge can be trained in a fortnight and temperament cannot.',
        ],
        steps: [
          'Phone or video screen — largely a test of how you sound and how clearly you explain things.',
          'Role play — a scripted difficult scenario, sometimes with an assessor deliberately escalating.',
          'Situational and metrics questions — how you prioritise a queue, when you escalate.',
          'Occasionally a written exercise — drafting a reply to a complaint email.',
        ],
      },
      {
        heading: 'The difficult customer question',
        body: [
          'Every interview includes some version of it. The structure that scores well is: acknowledge, take ownership, act, and confirm. What separates strong answers is that they include the moment where the candidate could not give the customer what they wanted, and handled that honestly rather than deflecting.',
        ],
        bullets: [
          'Acknowledge the impact before explaining anything. People need to feel heard before they can hear.',
          'Never blame a colleague, a system or a policy in front of the customer.',
          'Say what you can do, not only what you cannot.',
          'Give a specific next step with a time attached, and then meet it.',
          'Close the loop. The follow-up is what turns a complaint into retention.',
        ],
      },
      {
        heading: 'Metrics you should be able to discuss',
        bullets: [
          'CSAT — customer satisfaction, usually a post-contact survey score.',
          'NPS — likelihood to recommend, measured at a relationship level.',
          'First contact resolution — the proportion resolved without a second interaction.',
          'Average handling time — useful but easily gamed; be ready to say why chasing it alone is a mistake.',
          'Backlog and SLA adherence — how quickly tickets are answered against a promise.',
        ],
        body: [
          'You do not need to have hit any particular figure. You need to show that you understand what each metric encourages and what it distorts. A candidate who says "we improved handling time but our repeat-contact rate went up, so we changed how we measured it" is immediately credible.',
        ],
      },
      {
        heading: 'Preparing for the role play',
        steps: [
          'Ask at the start what the scenario is and who you are meant to be. Clarifying is not cheating.',
          'Slow down. Candidates rush when nervous, and rushing reads as dismissive to a customer.',
          'Use the customer\'s name and repeat the problem back in your own words.',
          'Do not invent a policy. Say what you would check and who you would ask.',
          'Finish with a summary and a next step, even if the assessor cuts you off before the resolution.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do I need previous call centre experience?',
        answer:
          'Often not. Retail, hospitality and any role involving members of the public transfers well. Frame it in the same language: volume handled, complaints resolved, satisfaction measured.',
      },
      {
        question: 'How should I answer a question about handling abuse?',
        answer:
          'Show that you stay calm, follow the employer\'s process for warning and ending a contact, and log it. Employers want to know you will neither escalate nor absorb it silently.',
      },
    ],
  },
]

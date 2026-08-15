# CareerHub — career platform

A mobile-first career resource site: job search with aggregation from LinkedIn / Indeed / other
boards, applications handled on-site or handed off to the partner board, original editorial
guidance on every page, free candidate tools, an employer dashboard and a moderation panel.

Built to satisfy Google AdSense's content and layout policies from day one.

---

## Run it (about three minutes)

Needs Docker for the database, so local development runs on the same engine as
production.

```bash
npm install
cp .env.example .env        # then set AUTH_SECRET (see below)
npm run db:up               # start PostgreSQL in Docker
npm run setup               # apply migrations + seed content
npm run dev                 # http://localhost:3000
```

Generate a real secret for `.env`:

```bash
echo "AUTH_SECRET=\"$(openssl rand -base64 32)\""
```

Already have a PostgreSQL instance? Skip `db:up` and point `DATABASE_URL` at it.

### Demo accounts

Password for all three is `password123`.

| Role | Email | Lands on |
| --- | --- | --- |
| Candidate | `candidate@careerhub.com.ng` | `/dashboard` |
| Employer | `employer@careerhub.com.ng` | `/employer` |
| Admin | `admin@careerhub.com.ng` | `/admin` |

The seed creates 8 categories, 6 companies, 16 jobs (a mix of direct, LinkedIn and Indeed
listings) and 14 long-form articles.

---

## Two kinds of account

The site behaves like any established job board: the two audiences never see each other's
controls.

| | Job seeker | Recruiter |
| --- | --- | --- |
| Sees "Post a job" | **Never** — header, mobile menu, bottom nav and footer all omit it | Yes, everywhere |
| Can post a job | No | Yes |
| Header action | "Find jobs" | "Post a job" |
| Bottom nav (mobile) | Home · Jobs · Tools · Advice · Me | Home · My jobs · Post · Applicants · Browse |
| Applies to jobs | Yes | — |
| Sees applicants | Own applications only | Every applicant for jobs they posted |

A signed-out visitor gets the chooser — **"I am a job seeker"** and **"I am a recruiter"** on the
homepage hero and on `/get-started` — which preselects the right role on the sign-up form.

If a job seeker reaches a recruiter URL directly, they are not shown an error. They land on
`/recruiter-access`, which explains that theirs is a job seeker account and offers one button to add
recruiter access to the same login (keeping their saved jobs and application history). Posting stays
genuinely unavailable to a job seeker account until they make that choice.

Recruiter ownership is `authorId OR company.ownerId` (`features/employer/scope.ts`), so a recruiter
always sees the applicants for jobs they posted, and can never see anyone else's.

---

## Brand assets

The logo is `images/ch3.jpg`. Everything shipped is generated from it, so
replacing that one file and re-running the generator updates the site, the
browser tab, the installed app icon and the social preview together:

| Output | Used for |
| --- | --- |
| `app/icon.png` | Browser tab favicon (Next file convention) |
| `app/apple-icon.png` | iOS home screen |
| `public/logo.png` | Header, footer, emails, `Organization` structured data |
| `public/logo-192.png`, `public/logo-512.png` | PWA manifest / install prompt |
| `public/og.png` | 1200x630 social preview for Google, LinkedIn, X, WhatsApp |

Two things worth knowing if you regenerate them. The square icons are cropped to
the mark rather than resized whole — the source has wide empty margins, and a
straight resize spends most of a 32px favicon on background. The social image is
a wide crop of the source rather than the logo pasted onto a flat colour, which
avoids a visible seam where the tile meets the background.

## Admin access

There is **one** way in, and it is invisible to everyone else.

Promote an account with `npm run make:admin -- you@example.com` (run it with no
argument to list existing accounts and their roles). Sign out and back in afterwards — the role
lives in the session cookie.

- The admin dashboard lives at **`https://careerhub.com.ng/admin`**.
- An **Admin** button appears in the site header only for a signed-in admin, carrying an amber
  badge with the number of listings waiting for review. On mobile, admin entries are added to the
  top of the drawer menu.
- No link to `/admin` is rendered anywhere for a job seeker, a recruiter or a signed-out visitor,
  and `/admin` redirects them away. `robots.txt` disallows it, so it never enters search results.
- Every moderation action is written to the audit log with the admin's identity.

Sections: **Overview** (queue counts, companies and reviews awaiting approval, recent activity),
**Moderate jobs** (publish / reject / feature / delete), **Users** (change roles).

To make yourself an admin on the live site, run this once against the production database:

```bash
npm run make:admin -- you@example.com          # local
DATABASE_URL="<production-url>" npm run make:admin -- you@example.com   # production
```

---

## Notifications

Every application sends **three** emails, and every new job posting sends **two**:

`ADMIN_EMAIL` is the operator inbox and defaults to **hiringhub001@gmail.com**. It receives a copy
of everything that happens on the site.

| Event | Goes to | Contains |
| --- | --- | --- |
| Application submitted | The candidate | Confirmation, what happens next, realistic response times, link to track it |
| Application submitted | The recruiter who posted the job | Candidate name, email, phone, CV, their note, link to the dashboard |
| Application submitted | Operator inbox | Full copy for oversight |
| Job posted | The recruiter | Confirmation, review status, prompt to share it off-site |
| Job posted | Operator inbox | Moderation alert with a link to the queue |
| New registration | The user | Welcome, tailored to job seeker or recruiter |
| New registration | Operator inbox | Who signed up and as what |
| 5 failed sign-ins for one address in 15 minutes | Operator inbox | Account, attempt count, source IP |

Failed sign-ins deliberately do **not** email on every failure: one mistyped password is noise, and
alerting on each would flood the inbox and hand an attacker a way to generate mail. The alert fires
once per window, on the attempt that crosses the threshold.

The candidate also gets an on-screen **"Application successful"** panel confirming the email is on
its way, that the employer has been notified, and how to track the application.

Delivery uses the Resend HTTP API (`lib/email.ts`) — no SDK. Every message is written to the
`EmailLog` table before sending, so:

- **with `RESEND_API_KEY` set** — mail is delivered and the row is marked `SENT`, or `FAILED` with
  the provider's error;
- **without it** — the row stays `QUEUED` and the message is logged to the console. Applications
  still save and the candidate still sees the success screen. Nothing throws because email is not
  configured yet.

To turn delivery on: verify `careerhub.com.ng` in Resend, then set `RESEND_API_KEY`, `EMAIL_FROM`
and `ADMIN_EMAIL`. Check `EmailLog` to audit what was sent.

---

## CVs

Candidates upload a real file from whatever device they are on — phone, tablet or laptop. There is
no "paste a link to your CV" field anywhere, because most people do not have their CV on a public
URL and asking for one loses applications.

- **Formats** PDF, DOC, DOCX, RTF or TXT, up to 5MB. Validated by MIME type, by extension (some
  Android browsers send no MIME type at all) and, for PDFs, by the file's own `%PDF` signature.
- **Stored as bytes in the database**, so the app needs no object storage to work end to end. The
  download route is the only reader, which keeps a later move to R2 or S3 contained.
- **Saved to the profile on first upload**, then offered as "use the CV on my profile" on every
  later application — one tap to apply after the first time.
- **Snapshotted onto the application**, so replacing the CV on your profile never changes what an
  employer already received.
- **Access controlled.** `/api/applications/[id]/cv` serves a CV only to the candidate who sent it,
  the recruiter who owns the job, or an admin. Everyone else gets a 404 rather than a 403, which
  would confirm the application exists. Responses are `private, no-store`.

The covering note is **optional**. A required essay costs more good applications than the bad ones
it filters out, and an empty box is more honest than a padded one.

---

## Posting a job

Five fields: title, company, city, country and a description. Everything else — salary, duties,
requirements, benefits, category, contact email — sits behind "Add more detail" and is optional. The
contact address defaults to the recruiter's own account, because we already know it.

Typing a job title offers a **template** (`content/job-templates.ts`) covering the roles small
employers actually post: web developer, customer service, virtual assistant, nanny, sales, driver,
teacher, accountant, cleaner, security, receptionist and more. Picking one fills the description,
duties, requirements, skills and category, all freely editable.

Recruiters choose how candidates apply, exactly as on LinkedIn:

- **Easy Apply** — the application happens on CareerHub, with the CV already on the candidate's
  profile. Applications land in the employer dashboard and are emailed out.
- **Apply on my site** — candidates are sent to the employer's own careers page, or an existing
  LinkedIn/Indeed listing. A bare domain is accepted and repaired rather than rejected.

Job cards and job pages carry an **Easy Apply** badge so candidates can see at a glance how much
work applying will be.

## Google sign-in

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` and a "Continue with Google" button appears on
sign-in and sign-up. Until then it renders nothing — there is never a button that fails when
pressed. Create the credentials at Google Cloud → APIs & Services → Credentials (type: Web
application) and register this exact redirect URI:

```
https://careerhub.com.ng/api/auth/google/callback
```

Accounts created this way have no password; signing in with one at the password form gets a clear
message pointing at the Google button rather than "incorrect password". An existing account with the
same address is linked rather than duplicated, and its role is left untouched.

## Job review, and why a posted job may not appear

Recruiter postings land as **`PENDING`** and are not public until an admin approves them. That is
deliberate — unmoderated boards fill with fraudulent listings, and the review is part of what an
AdSense reviewer assesses. It is also the most common reason a recruiter thinks "posting is
broken": the job saved fine, it is just waiting.

Three things make that unambiguous:

- the confirmation says the job is **not live yet** and is queued for review;
- the recruiter's job list shows an amber "Not live yet" note on every pending listing;
- the operator inbox gets an email immediately, and the header badge shows the queue count.

If you are running the site solo and want listings live the moment they are posted, set
`AUTO_PUBLISH_JOBS=true`. Leave it unset while you want a person to check each one.

## Expiring listings

Every posting gets a 30-day `expiresAt`. Once past, the job is removed from search, the sitemap and
the partner feed, and its page switches to "This job has closed" with the apply form replaced by
links to current roles. The page stays reachable so shared links do not 404, but it is `noindex`,
and `validThrough` in the `JobPosting` structured data lets Google drop it from Google Jobs
automatically.

## Posting jobs out to LinkedIn, Indeed and social

Traffic flows both ways.

**Inbound** — a recruiter can register a job that already lives on LinkedIn or Indeed; the Apply
button opens the employer's page there (badged, `nofollow`, new tab).

**Outbound** — CareerHub jobs are pushed to those platforms so candidates come back here to apply:

- **Share buttons** on every job page (LinkedIn, WhatsApp, X, Facebook, copy link), each tagged with
  UTM parameters so you can see in analytics which channel produced applications.
- **A ready-made post** on the recruiter's job list — copy the text, paste it into LinkedIn, Indeed
  or your own careers page. The link points back at the CareerHub job page.
- **An aggregator feed at `/feeds/jobs.xml`** in the Indeed XML job feed format, which Indeed,
  Jooble, Talent.com and Adzuna all accept. Submit that URL to each partner and your direct
  listings are indexed automatically. Only direct listings are included — syndicating a job whose
  application lives on another board would just duplicate that board's own listing. The feed is
  generated per request and invalidated whenever a job is published, closed or deleted, so an
  approved job reaches partners on their next poll.

---

## What is here

**Job seekers** — search and filter jobs, job detail pages with original analysis, apply on-site,
apply out to LinkedIn/Indeed, save jobs, track applications, profile, job alerts, resume builder,
cover letter builder, job match / skill gap tool.

**Employers** — register, post a job (direct or pointing at an existing LinkedIn/Indeed listing),
company profile generated from the posting, applicant list with status management, close listings.

**Admin** — moderate pending jobs (publish / reject / delete / feature), approve company profiles,
moderate company reviews, manage user roles, audit log of every moderation action.

**Editorial** — career advice, interview guides, salary guides and a blog, all rendered from one
structured article system with table of contents, FAQs, author attribution and related reading.

### The aggregation model

A job carries a `source` (`DIRECT`, `LINKEDIN`, `INDEED`, `GLASSDOOR`, `OTHER`) and an optional
`externalUrl`.

- **Direct listing** — candidate applies through the on-site form; the application lands in the
  employer dashboard.
- **Partner listing** — the page carries a "via LinkedIn" badge, the Apply button opens the
  employer's own application page (`rel="noopener noreferrer nofollow"`, new tab), and the page
  states plainly that CareerHub does not collect that application. The candidate can still save the
  job here to track it.
- **Both** — an employer posting a partner listing can tick "also accept applications through
  CareerHub", and candidates get both routes.

This is what keeps the aggregation honest, and it is also what keeps it AdSense-safe: we never
imply we own an application we do not handle.

### Why the job pages are not thin content

Every job page carries roughly **650–700 words of original editorial** on top of the employer's
listing — measured, not estimated. It is derived from the job's own attributes so no two pages are
alike (verified: summaries, career paths and salary insight all differ between any two jobs):

- a plain-English analysis of what the role actually involves;
- per-skill breakdowns from our own editorial skill library — what the skill means on the job, how
  it gets assessed at interview, how to evidence it on a CV;
- salary insight in context, or guidance on asking when no salary is published;
- a career path ladder appropriate to the advertised level;
- CV tailoring advice referencing the listing's own first responsibility;
- cover letter guidance, an application checklist, interview preparation;
- industry context, certifications, five generated FAQs, similar jobs and related reading.

Rendered job page: **~2,000 words**. Career guide: **~1,600**. Salary guide: **~1,100**. All
server-rendered, so it is in the HTML source that crawlers read.

---

## AdSense readiness

### Already done

- **Policy pages** — About, Contact, Privacy, Cookie Policy, Terms, Editorial Policy, Careers, FAQ,
  Accessibility Statement, Disclaimer, HTML sitemap. All substantive, all linked from the footer.
- **No thin pages.** Every page type carries original content. Filtered search URLs are
  `noindex`ed and disallowed in `robots.txt` so they cannot be read as doorway pages.
- **Ads are off until you turn them on.** `components/ad-slot.tsx` renders *nothing* while
  `NEXT_PUBLIC_ADSENSE_CLIENT` is empty — a reviewer never sees an empty ad box.
- **Compliant placements only.** Four allowed positions: mid-article, end-of-article, desktop
  sidebar, below a full page of results. There is deliberately **no placement beside an Apply
  button, inside a form, or above the fold on a job page** — the rule is enforced in the component,
  not by convention.
- **Labelled.** Every slot is `<aside aria-label="Advertisement">` with a visible "Advertisement"
  label and reserved height (no layout shift).
- **Consent banner** recording accept / essential-only, with the choice stored before any analytics
  or ad script would load.
- **SEO** — dynamic metadata, canonicals, Open Graph, Twitter cards, JSON-LD (`JobPosting`,
  `Article`, `Organization`, `WebSite`, `BreadcrumbList`, `FAQPage`, `AggregateRating`),
  `sitemap.xml`, `robots.txt`, RSS feed, breadcrumbs and heavy internal linking.
- **Correct HTTP status codes** — missing jobs and companies return a real 404, not a soft 404.
  Protected routes return 307 to sign-in.
- **Semantic, accessible HTML** — one `h1` per page, ordered headings, real buttons and labels,
  skip link, visible focus rings, 44px touch targets, `prefers-reduced-motion` respected.

### Before you apply to AdSense

1. **Deploy to a real domain** and set `NEXT_PUBLIC_SITE_URL`. AdSense will not approve
   `localhost` or a preview URL.
2. **Replace the seed content with real listings.** The seeded companies and jobs are illustrative
   examples with `example.com` URLs. Reviewers check. Post genuine roles, or import real ones with
   correct `externalUrl` values, before applying.
3. **Put real contact details** in `lib/site.ts` — the email addresses and address there are
   placeholders, and a working contact route is something reviewers verify.
4. **Let it age a little.** Have the site live, crawlable and populated for a couple of weeks with
   traffic arriving before applying. Applications from brand-new, empty sites are the most common
   rejection.
5. **Then** set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` and redeploy. The script tag,
   the `google-adsense-account` meta tag and the slots all activate from that one variable.

### Never do these (they will get you rejected or banned)

- Do not add an ad slot beside or above the Apply button. The placement policy in
  `components/ad-slot.tsx` exists for this reason — do not add placements outside its enum.
- Do not publish listings that only reprint a scraped description with no original analysis.
- Do not let employers publish without review; unmoderated boards fill with scam listings, and a
  scam listing is both an AdSense problem and a real harm to your users.
- Do not click your own ads, and do not ask anyone to.

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` locally; a Postgres URL in production |
| `AUTH_SECRET` | yes | Session signing key, min 32 chars — `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | production | Canonical origin, used by metadata and sitemap |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | no | `ca-pub-…`. Ads render only when set |
| `NEXT_PUBLIC_GA_ID` | no | GA4 measurement ID |
| `NEXT_PUBLIC_CLARITY_ID` | no | Microsoft Clarity project ID |
| `RESEND_API_KEY` | no | For email once you wire up verification and alerts |

`lib/env.ts` validates these with Zod at boot, so a bad deploy fails immediately rather than at the
first request.

---

## Architecture

```
app/                     routes (App Router, Server Components by default)
  jobs/ company/ career/ salary/ interview/ blog/   public content
  dashboard/ employer/ admin/                        authenticated areas
  tools/                                             client-side free tools
  sitemap.ts robots.ts rss.xml/ manifest.ts          SEO surface
components/              shared UI primitives, header, footer, nav, ad slot
features/                feature modules — queries, server actions, forms
  jobs/ auth/ candidate/ employer/ admin/ content/ tools/ site/
content/                 editorial source: articles and the skill library
lib/                     db, auth, seo, enrichment, rate limiting, env, utils
prisma/                  schema and seed
```

- **Server Components everywhere** except the eight places that need interactivity (filters, forms,
  theme toggle, mobile menu, the three tools). Client bundle is ~105 kB shared.
- **Server Actions** for every mutation — no REST layer to keep in sync. Each one validates with
  Zod, rate limits, checks authorisation, and returns a typed `ActionState` the form renders.
- **Ownership checks on every employer/admin action.** An employer can only touch applications and
  jobs belonging to their own company; admin actions write an audit log entry.

### Security

CSRF-resistant `SameSite=Lax` HTTP-only session cookies (JWT via `jose`), bcrypt password hashing,
Zod validation on every input, Prisma parameterised queries, rate limiting on sign-in, sign-up,
apply, alerts and contact, honeypot on the contact form, open-redirect protection on the `next`
parameter, identical error messages for unknown-email and wrong-password (no account enumeration),
strict security headers including HSTS, and `nofollow noopener` on every outbound employer link.

Uploaded CVs are personal data and are treated as such: served only to the candidate who sent one,
the recruiter who owns the job, or an admin; `private, no-store` so no CDN or proxy retains a copy;
`X-Content-Type-Options: nosniff`; and a 404 rather than a 403 for everyone else, since a 403 would
confirm the application exists. Uploads are validated by MIME type, extension and file signature,
and capped at 5MB — the server-action body limit in `next.config.ts` is set to match.

---

## Moving to production

### Database

PostgreSQL throughout — local and production run the same engine, so there is no class of bug that
only appears after deploy. Migrations live in `prisma/migrations/` and are applied by the build.

After changing `prisma/schema.prisma`, run `npx prisma migrate dev --name what_changed` and commit
the generated migration.

Search uses `contains` with `mode: 'insensitive'`. That is an ILIKE scan; when the listing count
makes it slow, replace `buildJobWhere` in `features/jobs/queries.ts` with a `tsvector` index or
Meilisearch. It is the single seam for that change.

### Checking the live site

`npm run check:live` reports, in one command, whether the domain resolves, whether the deployment
is serving, whether the Google tags are present and whether any jobs are published. DNS is queried
through Google's public resolver — the same view Google's crawler gets, which differs from what a
dashboard shows — and the deployment is fetched directly at Vercel's IP, so "DNS not published" is
distinguishable from "site broken". Those are very different problems and look identical from a
browser.

### Deploy to Vercel

The build queries the database (to pre-render job and article pages) and applies migrations, so
**`DATABASE_URL` must be set before the first deploy or the build will fail**. That is exactly what
the `Environment variable not found: DATABASE_URL` error means.

1. Create a PostgreSQL database on Neon or Supabase and copy its pooled connection string.
2. In Vercel → Settings → Environment Variables, add these for Production **and** Preview:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | your Neon/Supabase connection string |
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXT_PUBLIC_SITE_URL` | `https://careerhub.com.ng` |
   | `RESEND_API_KEY` | from Resend, once the domain is verified |
   | `EMAIL_FROM` | `CareerHub <notifications@careerhub.com.ng>` |
   | `ADMIN_EMAIL` | `hiringhub001@gmail.com` |
   | `NEXT_PUBLIC_GA_ID` | `G-DEXV6YXTZB` (optional — defaulted in code) |

3. Add `careerhub.com.ng` under Settings → Domains and point the DNS records Vercel gives you.
4. Redeploy. `npm run build` runs `prisma generate && prisma migrate deploy && next build`, so the
   schema is created on first deploy from `prisma/migrations/`.
5. Seed the production database once, from your machine, with production `DATABASE_URL` set:
   `npm run db:seed`. Only do this on an empty database — the seed clears the tables it owns.

If the database is briefly unreachable during a build, page pre-rendering degrades to on-demand
rendering rather than failing the deploy; migrations are the only hard dependency.

**Docker** — `docker build -t careerhub . && docker run -p 3000:3000 --env-file .env careerhub`.

**CI** — `.github/workflows/ci.yml` runs install, generate, db push, seed, typecheck, lint and
build on every push and PR.

### Known constraint

The mobile drawer is rendered through a React portal onto `<body>`. That is deliberate and should
not be "simplified" back into the header: the header uses `backdrop-blur`, and a `backdrop-filter`
establishes a containing block for fixed-position descendants — so a drawer inside the header sizes
itself against the 64px header rather than the viewport, and its off-screen box widens the entire
document. `npm run test:layout` catches a regression of this at every breakpoint.

### Not built yet — read before launch

These are on your launch checklist and are genuinely missing. Nothing else in this README describes
something that does not work.

- **Password reset.** There is no "forgot password" flow. Sign-in and registration work; a user who
  forgets their password currently cannot recover the account without an admin. This is the single
  biggest gap for a public launch and the next thing to build now that email is wired up.
- **Email verification.** Registration sets `emailVerified` immediately rather than sending a
  confirmation link.
- **CAPTCHA / bot protection.** Rate limiting and a honeypot on the contact form only. Add Turnstile
  (free, Cloudflare, and you are already using them for DNS) on registration and application before
  opening to real traffic.
- **CV malware scanning.** Uploads are validated by type, extension, signature and size, but not
  scanned. Add ClamAV or a scanning API before employers download files from strangers.
- **Admin 2FA.**
- **Cloudflare R2.** CVs are in PostgreSQL, which works but is not where large files belong long
  term.

### Deliberately deferred

These were left out to keep the build runnable today; each is a contained addition:

- **Email.** Sign-up sets `emailVerified` immediately and job alerts are stored but not yet sent.
  Wire Resend into `features/auth/actions.ts` (token + verify link) and add a cron route that
  queries `JobAlert` and sends matches.
- **Auth.js.** Authentication is a self-contained ~120-line module (`lib/auth.ts`) rather than
  Auth.js, which avoids a beta dependency and an adapter. Swapping in Auth.js for OAuth providers
  means replacing that one file — nothing else imports session internals.
- **Meilisearch.** Search is Prisma `contains` across title, skills, description and company. At a
  few thousand listings that is fine; `buildJobWhere` in `features/jobs/queries.ts` is the single
  seam to replace when it is not.
- **Redis / Upstash.** Rate limiting is in-memory, correct for a single instance. `lib/rate-limit.ts`
  has one function to swap for `@upstash/ratelimit` when you run multiple instances. The per-IP
  caps are deliberately generous (30 sign-ups and 40 applications per hour) because carrier-grade
  NAT on Nigerian mobile networks puts many genuine users behind one IP — a tight cap would lock
  out a whole cell tower. Move to per-account limits when you have real traffic to measure.
- **Object storage for CVs.** Uploaded CVs are stored as bytes in PostgreSQL, which keeps the
  app dependency-free and works identically in every environment. At high volume move them to R2 or
  S3 — `app/api/applications/[id]/cv/route.ts` is the only reader, so the change is contained.
  Add virus scanning at the same time.

---

## Google Analytics and consent

The GA4 measurement ID is **`G-DEXV6YXTZB`**, defaulted in `lib/site.ts` and overridable with
`NEXT_PUBLIC_GA_ID`.

It is defaulted in code on purpose. `NEXT_PUBLIC_*` variables are inlined at build time, so an
unset variable in Vercel produced *no tag at all* — indistinguishable from a broken install, and a
silent failure that is easy to lose hours to. A measurement ID is public anyway: it appears in the
page source of every site that uses one. To point at a different property, set `NEXT_PUBLIC_GA_ID`
and redeploy; no code change needed.

The tag is rendered as raw `<script>` tags at the top of `<head>` (`components/google-tag.tsx`)
rather than through `next/script`. That is deliberate: `next/script` with `afterInteractive`
injects the tag only after hydration, which is a common reason a correctly instrumented site still
fails Google's detection. Both scripts are `async`, so nothing is render-blocking. Exactly one tag
is emitted per page — Google rejects pages carrying more than one, and the test suite asserts it.

**Consent Mode v2** is configured, which is what Google asks for if you have EEA visitors:

- `gtag('consent', 'default', …)` runs *before* the tag loads with `ad_storage`, `ad_user_data`,
  `ad_personalization` and `analytics_storage` all **denied**;
- a previously stored choice is re-applied in the same inline script, so a returning visitor's
  consent is active before the first hit;
- the cookie banner calls `gtag('consent', 'update', …)` when the visitor chooses.

Until consent is given the tag writes no cookies and sends cookieless pings only, which is what
keeps the Cookie Policy accurate. Verified end to end in the journey test: denied on load, granted
after Accept, persisted across reloads.

## Sitemap and robots

`sitemap.xml` is generated from the database, so every live job, company profile and article is
included automatically and expired jobs drop out. It contains no query-string URLs.

Category and location landing pages live at `/jobs/category/[slug]` and `/jobs/location/[slug]`
rather than `?category=` filters. That matters: `robots.txt` blocks `/jobs?` to stop filtered
search URLs competing with `/jobs`, so a sitemap full of `?category=` links would be asking Google
to crawl exactly what we told it not to. Each landing page carries its own written introduction, and
is only submitted once it has enough live roles to be worth reading — one job for a category, three
for a location, since category copy is hand-written and location copy is generated. Below the
threshold the page still renders for anyone following a link, but it is `noindex`.

On `Disallow: /jobs?`: `?` is a literal character in robots.txt — only `*` and a trailing `$` are
wildcards — so that rule matches `/jobs?q=react` and leaves `/jobs`, `/jobs/some-job-slug`,
`/jobs/category/...` and `/jobs/location/...` untouched. `npm run test:seo` asserts each of those
cases, and cross-checks that no sitemap URL is blocked by any robots rule.

## Analytics events

`lib/analytics.ts` defines a closed set of event names — free-text names are how an analytics
account becomes unusable. Nothing is sent unless `NEXT_PUBLIC_GA_ID` is set **and** the visitor
accepted analytics cookies.

Tracked: `job_search`, `job_view`, `apply_click`, `apply_submitted`, `external_apply_click`,
`job_saved`, `job_shared`, `sign_up`, `employer_sign_up`, `job_posted`, `resume_download`,
`article_view`, `job_alert_created`.

## AdSense

The publisher ID is `ca-pub-5839819198342011`, held in `lib/site.ts` rather than an environment
variable — it is public, and a build-time variable is how a tag silently goes missing.

Two separate switches:

- **`adsenseClient`** — the verification script (`components/adsense-script.tsx`), rendered as a raw
  `<script>` in `<head>` exactly like the Google tag, because that is what AdSense's review looks
  for. Always on.
- **`adsEnabled`** — whether `<ins class="adsbygoogle">` units actually render. **`false` until the
  account is approved.** Ad slots are already positioned throughout the site; flip this one boolean
  after approval and they come to life. Showing empty slots to a reviewer reads as an unfinished
  site, and Google asks publishers not to place ad code before approval.

`/ads.txt` is generated from the publisher ID, so there is nothing to maintain by hand.

### A note on `??` versus `||`

The public IDs use `process.env.X || 'default'`, not `??`. These variables are typically present in
`.env` but empty, and `??` only falls back on `undefined` — an empty string passes straight through
and disables the tag. That single character is what kept Microsoft Clarity from loading despite
being configured.

## Keeping credentials out of git

`.env.example` is a committed file, so a real key pasted into it leaves your machine the moment you
push. GitHub's push protection catches that, but only after the commit exists. Enable the local
guard once per clone to catch it before:

```bash
git config core.hooksPath .githooks
```

Real credentials belong in `.env` (gitignored) and in the Vercel environment settings.

## Tests

`npm run test:e2e` drives a real headless browser through the whole journey against a built server:

```bash
npm run build && npx next start -p 3200 &
npm run test:e2e
```

45 assertions covering: the role chooser, recruiter sign-up, posting a job, the `PENDING` review
state, admin approval, the job becoming findable in search, a job seeker uploading a real PDF and
applying with no covering note, the "Application successful" screen, the CV being stored as bytes
and mirrored to the profile, all three application emails plus both job-posting emails being queued
to the right addresses, the applicant appearing for the recruiter, CV download by the applicant and
the recruiter, CV download being refused to signed-out visitors and unrelated candidates, status
changes, the absence of any posting control for job seekers, the `/recruiter-access` path instead of
an error, and the outbound aggregator feed.

`npm run test:layout` guards against horizontal overflow — the sideways scroll and cut-off content
that breaks phone and tablet layouts. It loads 13 pages at 7 widths from 320px to 1440px, with the
mobile drawer open and closed, and fails with the specific element responsible. 95 checks.

## Commands

```bash
npm run dev          # development server
npm run build        # generate + migrate + build
npm run start        # production server
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run db:seed      # reseed (wipes and recreates the seeded tables)
npm run db:studio    # Prisma Studio
npm run setup        # generate + db push + seed
npm run test:e2e     # full browser journey (needs a server running)
npm run test:layout  # horizontal-overflow audit across 7 breakpoints
npm run test:seo     # sitemap/robots cross-check, coverage and canonicals
npm run check:live   # DNS, deployment, Google tags and content on the live domain
npm run db:up        # start PostgreSQL in Docker
npm run db:down      # stop it
```

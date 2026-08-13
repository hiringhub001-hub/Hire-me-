'use client'

import { useState } from 'react'

import { track } from '@/lib/analytics'

/**
 * Outbound distribution.
 *
 * Every link points back at the CareerHub job page, so a recruiter promoting a
 * role on LinkedIn, Indeed or WhatsApp sends applicants here to apply. UTM tags
 * let them see in analytics which channel actually produced applications.
 */

type Channel = {
  key: string
  label: string
  href: (url: string, text: string) => string
  className: string
}

const channels: Channel[] = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    className: 'bg-[#0a66c2] hover:bg-[#0a5aad]',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    className: 'bg-[#25d366] hover:bg-[#1fb855]',
  },
  {
    key: 'x',
    label: 'X',
    href: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    className: 'bg-slate-900 hover:bg-slate-700',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    className: 'bg-[#1877f2] hover:bg-[#1568da]',
  },
]

export function ShareJob({
  url,
  title,
  company,
  variant = 'candidate',
}: {
  url: string
  title: string
  company: string
  /** Recruiters get the promotion framing and a copyable post. */
  variant?: 'candidate' | 'recruiter'
}) {
  const [copied, setCopied] = useState<'link' | 'post' | null>(null)

  const text =
    variant === 'recruiter'
      ? `We are hiring: ${title} at ${company}. Full details and apply here:`
      : `${title} at ${company} — job details and how to apply:`

  const tagged = (channel: string) =>
    `${url}${url.includes('?') ? '&' : '?'}utm_source=${channel}&utm_medium=social&utm_campaign=job_share`

  const post = `We are hiring: ${title} at ${company}.

Full description, requirements and salary details are on our listing — you can apply directly there:
${tagged('linkedin')}

#hiring #jobs #${company.replace(/[^a-zA-Z0-9]/g, '')}`

  async function copy(value: string, kind: 'link' | 'post') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {channels.map((channel) => (
          <a
            key={channel.key}
            href={channel.href(tagged(channel.key), text)}
            onClick={() => track('job_shared', { channel: channel.key, job_title: title })}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-white transition ${channel.className}`}
          >
            {channel.label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => copy(url, 'link')}
          className="inline-flex h-10 items-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {copied === 'link' ? 'Link copied' : 'Copy link'}
        </button>
      </div>

      {variant === 'recruiter' ? (
        <div className="mt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ready-made post for LinkedIn, Indeed or your careers page. Applicants land on your
            CareerHub job page and apply there.
          </p>
          <textarea
            readOnly
            rows={7}
            value={post}
            aria-label="Shareable job post text"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          />
          <button
            type="button"
            onClick={() => copy(post, 'post')}
            className="mt-2 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {copied === 'post' ? 'Post copied' : 'Copy post text'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

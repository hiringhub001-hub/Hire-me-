import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

export function Container({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('mx-auto w-full max-w-content px-4 sm:px-6', className)}>{children}</div>
}

export function Section({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <section className={cn('py-10 sm:py-14', className)}>{children}</section>
}

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                  */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string
  title: string
  intro?: string
  children?: ReactNode
}) {
  return (
    <header className="mb-8">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {title}
      </h1>
      {intro ? (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {intro}
        </p>
      ) : null}
      {children}
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                    */
/* -------------------------------------------------------------------------- */

const buttonVariants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-400',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
  outline:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  ghost:
    'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const

const buttonSizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm sm:text-base',
  lg: 'h-12 px-6 text-base',
} as const

type ButtonStyleProps = {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
}

export function buttonClass({ variant = 'primary', size = 'md' }: ButtonStyleProps = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
    buttonVariants[variant],
    buttonSizes[size],
  )
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<'button'> & ButtonStyleProps) {
  return <button className={cn(buttonClass({ variant, size }), className)} {...props} />
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={cn(buttonClass({ variant, size }), className)} {...props} />
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
  className?: string
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  } as const
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-800 dark:text-slate-100"
      >
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-brand-900'

export function Alert({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'error'
  children: ReactNode
}) {
  const tones = {
    info: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-100',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
    error:
      'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100',
  } as const
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm', tones[tone])} role="status">
      {children}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Structured data                                                             */
/* -------------------------------------------------------------------------- */

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Values come from our own database and are serialised, not interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export function Breadcrumbs({ crumbs }: { crumbs: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-slate-500 dark:text-slate-400">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-slate-700 dark:text-slate-200">{crumb.name}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-brand-600 hover:underline">
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

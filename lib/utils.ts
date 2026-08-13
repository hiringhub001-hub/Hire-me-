import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

/** Splits the newline separated text columns used across the schema. */
export function lines(value?: string | null): string[] {
  if (!value) return []
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function csv(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function formatSalary(
  min?: number | null,
  max?: number | null,
  currency = 'USD',
  period = 'YEAR',
): string | null {
  if (!min && !max) return null
  const fmt = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      notation: value >= 10000 ? 'compact' : 'standard',
    }).format(value)
  const suffix = period === 'YEAR' ? '/yr' : period === 'MONTH' ? '/mo' : '/hr'
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  return `${fmt((min ?? max)!)}${suffix}`
}

export function timeAgo(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - value.getTime()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, secondsInUnit] of units) {
    const amount = Math.floor(seconds / secondsInUnit)
    if (amount >= 1) return rtf.format(-amount, unit)
  }
  return 'just now'
}

export function formatDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(value)
}

export const workModeLabels: Record<string, string> = {
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
}

export const employmentLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary',
}

export const experienceLabels: Record<string, string> = {
  ENTRY: 'Entry level',
  JUNIOR: 'Junior',
  MID: 'Mid level',
  SENIOR: 'Senior',
  LEAD: 'Lead / Principal',
}

export const educationLabels: Record<string, string> = {
  HIGH_SCHOOL: 'High school',
  DIPLOMA: 'Diploma',
  BACHELOR: "Bachelor's degree",
  MASTER: "Master's degree",
  PHD: 'PhD',
}

export const applicationStatusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  REVIEWING: 'In review',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Not selected',
  HIRED: 'Hired',
}

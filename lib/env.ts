import { z } from 'zod'

/**
 * Validated environment. Imported by anything that touches secrets so a bad
 * deploy fails at boot rather than at the first request.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters — run: openssl rand -base64 32'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
})

const parsed = schema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
})

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
  throw new Error(`Invalid environment variables:\n${issues}\n\nCopy .env.example to .env.`)
}

export const env = parsed.data

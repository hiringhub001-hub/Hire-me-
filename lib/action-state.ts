export type ActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  /** Field-level messages keyed by input name. */
  errors?: Record<string, string>
}

export const idleState: ActionState = { status: 'idle' }

export function fail(message: string, errors?: Record<string, string>): ActionState {
  return { status: 'error', message, errors }
}

export function ok(message: string): ActionState {
  return { status: 'success', message }
}

/** Flattens a Zod error into the field map used by forms. */
export function fieldErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

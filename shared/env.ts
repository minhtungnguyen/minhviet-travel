import { z } from 'zod'

/**
 * Lazily validated environment access. Never parsed at module top level —
 * `pnpm build` must keep succeeding with zero SUPABASE_* vars set (the
 * Sprint 1A guarantee, unchanged: nothing here runs until a request
 * handler or client factory actually calls one of these functions).
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

const serviceRoleEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

function formatIssues(issues: { path: PropertyKey[] }[]): string {
  return issues.map((issue) => issue.path.join('.') || '(root)').join(', ')
}

/** URL + anon key — safe for any context, including the browser. */
export function getPublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  if (!parsed.success) {
    throw new Error(`Missing or invalid Supabase public environment variables: ${formatIssues(parsed.error.issues)}`)
  }
  return parsed.data
}

/**
 * Includes the service-role key. Callers of this function must be
 * server-only (`shared/supabase/admin-client.ts` is the only caller) —
 * this function itself does not enforce that, `import 'server-only'`
 * upstream does.
 */
export function getServiceRoleEnv() {
  const parsed = serviceRoleEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
  if (!parsed.success) {
    throw new Error(`Missing or invalid Supabase service-role environment variables: ${formatIssues(parsed.error.issues)}`)
  }
  return parsed.data
}

const anthropicEnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
})

/** AI Import (Sprint 7 Phase 7) — server-only, only called from integrations/ai/providers/anthropic-tour-import-provider.ts when a job is actually run. */
export function getAnthropicEnv() {
  const parsed = anthropicEnvSchema.safeParse({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  })
  if (!parsed.success) {
    throw new Error(`Missing or invalid Anthropic environment variables: ${formatIssues(parsed.error.issues)}`)
  }
  return parsed.data
}

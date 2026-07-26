import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/supabase/database.types'
import { getServiceRoleEnv } from '@/shared/env'

/**
 * Service-role client — bypasses RLS entirely. `import 'server-only'`
 * fails the build if any client component ever imports this file.
 *
 * Restricted to the two documented exceptions where RLS structurally
 * cannot express the required check (docs/database/rls-policy-matrix.md):
 *   1. `modules/audit` — audit_logs/audit_log_changes have no INSERT
 *      policy for any authenticated role, by design (append-only,
 *      server-side-logger-only).
 *   2. The public form-submission route — form_submissions has no anon
 *      INSERT policy (master-prompt §12: no unrestricted public inserts
 *      into complex application tables); Zod validation, honeypot and
 *      idempotency checks run first, then this client writes the row.
 *
 * Never use this client for an ordinary authenticated user's own action —
 * that goes through `getServerSupabaseClient()` so RLS remains the actual
 * gate, per docs/security/security-model.md's two-layer model.
 */
export function getAdminSupabaseClient() {
  const env = getServiceRoleEnv()
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

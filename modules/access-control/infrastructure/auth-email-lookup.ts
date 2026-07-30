import 'server-only'
import { getAdminSupabaseClient } from '@/shared/supabase/admin-client'

/**
 * `user_profiles` deliberately has no `email` column (Supabase Auth owns
 * it exclusively — master-prompt §8.2, "no custom password/identity
 * table"). Displaying an admin Users list without an email is close to
 * useless, and no RLS policy can grant an ordinary session read access
 * to `auth.users` (Postgres doesn't expose that schema via PostgREST to
 * non-admin roles at all) — so this is a 4th, narrowly-scoped exception
 * to the service-role client alongside the 3 already documented in
 * `docs/security/security-model.md`/`docs/security/authorization-flow.md`
 * (audit logger, public form submission, guest ticket checkout). Only
 * ever reads `auth.users` by id for ids the caller already resolved
 * through a permission-gated `user_profiles` query — never used to
 * enumerate or search identities on its own.
 */
export async function lookupAuthEmails(userIds: string[]): Promise<Map<string, string>> {
  const admin = getAdminSupabaseClient()
  const entries = await Promise.all(
    userIds.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id)
      return [id, data.user?.email ?? ''] as const
    }),
  )
  return new Map(entries)
}

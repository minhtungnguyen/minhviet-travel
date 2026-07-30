'use server'

import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog, recordSecurityEvent } from '@/modules/audit/application/audit.service'
import { newRequestId } from '@/shared/http/request-id'
import { safeRedirectPath } from '@/shared/http/safe-redirect'
import { DISABLED_ACCOUNT_STATUSES, type AccountStatus } from '@/shared/auth/guards'

export type LoginResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason: 'invalid_credentials' | 'account_disabled' }

/**
 * Runs server-side so it can (a) set the session cookie itself — Server
 * Actions, unlike Server Component renders, are allowed to write cookies
 * — and (b) write to audit_logs/security_events, which need the
 * service-role client. Deliberately a Server Action, not a client-side
 * `signInWithPassword()` call, so login and its audit trail land in one
 * server round-trip (docs/backend/auth/02-auth-architecture.md §2).
 *
 * Never reveals *why* a login failed — invalid credentials and a
 * disabled account both come back as generic failures to the caller;
 * `reason` exists only so the UI can pick a slightly different message,
 * never to help a caller distinguish "wrong password" from "no such
 * account" (master-prompt §12: don't leak account existence).
 */
export async function loginAction(email: string, password: string, next: string | null): Promise<LoginResult> {
  const requestId = newRequestId()
  const supabase = await getServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    await recordSecurityEvent({
      actorUserId: null,
      eventType: 'LOGIN_FAILURE',
      metadata: { reason: 'invalid_credentials' },
    })
    return { ok: false, reason: 'invalid_credentials' }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('account_status')
    .eq('id', data.user.id)
    .maybeSingle()

  // Covers both a suspended/disabled/terminated profile and the case
  // where no user_profiles row exists yet at all (an auth.users identity
  // Supabase considers valid, but this application does not) — both mean
  // the same thing to the caller: this account cannot use the product.
  if (!profile || DISABLED_ACCOUNT_STATUSES.includes(profile.account_status as AccountStatus)) {
    await recordSecurityEvent({
      actorUserId: data.user.id,
      eventType: 'LOGIN_FAILURE',
      metadata: { reason: 'account_disabled' },
    })
    await supabase.auth.signOut()
    return { ok: false, reason: 'account_disabled' }
  }

  await supabase.from('user_profiles').update({ last_login_at: new Date().toISOString() }).eq('id', data.user.id)

  await recordAuditLog({
    actorUserId: data.user.id,
    action: 'auth.login.succeeded',
    entityType: 'auth',
    entityId: data.user.id,
    requestId,
    source: 'admin-ui',
  })

  return { ok: true, redirectTo: safeRedirectPath(next, '/admin') }
}

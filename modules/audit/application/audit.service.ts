import 'server-only'
import { getAdminSupabaseClient } from '@/shared/supabase/admin-client'
import { logger } from '@/shared/logging/logger'
import type { AuditLogInput, SecurityEventInput } from '@/modules/audit/domain/types'
import type { Json } from '@/shared/supabase/database.types'

/**
 * Writes one row to `audit_logs` via the service-role client — the table
 * has no INSERT policy for any authenticated role by design
 * (docs/database/rls-policy-matrix.md: "inserts happen exclusively via
 * the server-side audit logger using the service role").
 *
 * Best-effort: a failed audit write is logged loudly but never thrown,
 * so a transient logging failure can't block the legitimate operation
 * that triggered it. Every caller already completed its actual mutation
 * before calling this.
 */
export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const admin = getAdminSupabaseClient()
    const { error } = await admin.from('audit_logs').insert({
      actor_user_id: input.actorUserId,
      organization_id: input.organizationId ?? null,
      website_id: input.websiteId ?? null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      request_id: input.requestId,
      source: input.source ?? 'api',
      success: input.success ?? true,
      reason: input.reason ?? null,
    })
    if (error) {
      logger.error(input.requestId, 'Failed to write audit log', {
        action: input.action,
        entityType: input.entityType,
        error: error.message,
      })
    }
  } catch (error) {
    logger.error(input.requestId, 'Unexpected error writing audit log', {
      action: input.action,
      entityType: input.entityType,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Writes one row to `security_events` — same append-only/service-role
 * pattern as `recordAuditLog`, for events with no resolved actor/entity
 * (e.g. a failed login) rather than a structural change to a named
 * entity. `event_type` examples ('LOGIN_FAILURE', 'PERMISSION_DENIED',
 * 'SUSPICIOUS_ACTIVITY') are the same ones documented directly in
 * database/migrations/0013_audit.sql.
 */
export async function recordSecurityEvent(input: SecurityEventInput): Promise<void> {
  try {
    const admin = getAdminSupabaseClient()
    const { error } = await admin.from('security_events').insert({
      actor_user_id: input.actorUserId,
      event_type: input.eventType,
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
      metadata: (input.metadata ?? {}) as Json,
    })
    if (error) {
      logger.error('security-event', 'Failed to write security event', {
        eventType: input.eventType,
        error: error.message,
      })
    }
  } catch (error) {
    logger.error('security-event', 'Unexpected error writing security event', {
      eventType: input.eventType,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

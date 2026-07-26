import 'server-only'
import { getAdminSupabaseClient } from '@/shared/supabase/admin-client'
import { logger } from '@/shared/logging/logger'
import type { AuditLogInput } from '@/modules/audit/domain/types'

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

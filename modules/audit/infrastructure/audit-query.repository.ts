import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type { AuditLogRecord, SecurityEventRecord } from '@/modules/audit/domain/types'

function mapAuditLog(row: {
  id: string
  actor_user_id: string | null
  organization_id: string | null
  website_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  request_id: string | null
  source: string
  success: boolean
  reason: string | null
  ip_address: unknown
  user_agent: string | null
  created_at: string
}): AuditLogRecord {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    organizationId: row.organization_id,
    websiteId: row.website_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    requestId: row.request_id,
    source: row.source,
    success: row.success,
    reason: row.reason,
    ipAddress: row.ip_address ? String(row.ip_address) : null,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  }
}

function mapSecurityEvent(row: {
  id: string
  actor_user_id: string | null
  event_type: string
  ip_address: unknown
  user_agent: string | null
  metadata: unknown
  created_at: string
}): SecurityEventRecord {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    ipAddress: row.ip_address ? String(row.ip_address) : null,
    userAgent: row.user_agent,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.created_at,
  }
}

export interface AuditQueryRepository {
  listAuditLogs(query: PaginationQuery): Promise<PaginatedResult<AuditLogRecord>>
  listSecurityEvents(query: PaginationQuery): Promise<PaginatedResult<SecurityEventRecord>>
}

/**
 * Read-only counterpart to `recordAuditLog`/`recordSecurityEvent`
 * (`modules/audit/application/audit.service.ts`, which only ever
 * inserts). Uses the session-bound client (not service-role) — RLS's
 * `staff_read_audit_logs`/`staff_read_security_events` policies already
 * require `audit.read`, matching the service-layer
 * `requirePermission(actor, 'audit.read')` gate one layer up in
 * `AuditQueryService` (two-layer authorization, same as every other
 * module — docs/security/security-model.md).
 */
export class SupabaseAuditQueryRepository implements AuditQueryRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listAuditLogs(query: PaginationQuery): Promise<PaginatedResult<AuditLogRecord>> {
    const from = (query.page - 1) * query.pageSize
    let builder = this.client.from('audit_logs').select('*', { count: 'exact' })
    if (query.search) builder = builder.or(`action.ilike.%${query.search}%,entity_type.ilike.%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(from, from + query.pageSize - 1)
    if (error) throw mapDatabaseError(error, 'AuditLog')
    return { items: (data ?? []).map(mapAuditLog), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }

  async listSecurityEvents(query: PaginationQuery): Promise<PaginatedResult<SecurityEventRecord>> {
    const from = (query.page - 1) * query.pageSize
    let builder = this.client.from('security_events').select('*', { count: 'exact' })
    if (query.search) builder = builder.ilike('event_type', `%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(from, from + query.pageSize - 1)
    if (error) throw mapDatabaseError(error, 'SecurityEvent')
    return { items: (data ?? []).map(mapSecurityEvent), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }
}

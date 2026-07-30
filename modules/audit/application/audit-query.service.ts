import { requirePermission, type ActorContext } from '@/shared/auth/session'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type { AuditLogRecord, SecurityEventRecord } from '@/modules/audit/domain/types'
import type { AuditQueryRepository } from '@/modules/audit/infrastructure/audit-query.repository'

/**
 * Read side of the audit trail — powers the Admin Shell's Audit Logs
 * screen. `audit.read` gate here mirrors the RLS policy on both tables
 * (`staff_read_audit_logs`/`staff_read_security_events`); this is the
 * service-layer half of the two-layer model, not a replacement for it.
 */
export class AuditQueryService {
  constructor(private readonly repository: AuditQueryRepository) {}

  async listAuditLogs(actor: ActorContext, query: PaginationQuery): Promise<PaginatedResult<AuditLogRecord>> {
    requirePermission(actor, 'audit.read')
    return this.repository.listAuditLogs(query)
  }

  async listSecurityEvents(actor: ActorContext, query: PaginationQuery): Promise<PaginatedResult<SecurityEventRecord>> {
    requirePermission(actor, 'audit.read')
    return this.repository.listSecurityEvents(query)
  }
}

/**
 * Domain type for database/migrations/0013_audit.sql#audit_logs. Pulled
 * forward from its originally-planned Checkpoint 4 slot because every
 * mutating service in Checkpoint 3 (organization, RBAC, settings) must
 * call it — "Audit all structural changes" is a hard rule of the
 * Organization module itself, not something that can wait.
 */
export type AuditLogInput = {
  actorUserId: string | null
  organizationId?: string | null
  websiteId?: string | null
  /** Dotted convention, e.g. 'organization.updated', 'role.assigned'. */
  action: string
  entityType: string
  entityId?: string | null
  requestId: string
  source?: 'api' | 'admin-ui' | 'system'
  success?: boolean
  reason?: string
}

/**
 * Every mutating service takes this as a constructor dependency (same
 * pattern as the repository interface) rather than importing
 * `recordAuditLog` directly — `modules/audit/application/audit.service.ts`
 * pulls in the service-role admin client, which is `import 'server-only'`
 * guarded and throws unconditionally outside Next's build-time aliasing;
 * injecting it keeps every service unit-testable with an in-memory fake.
 * Route files pass the real `recordAuditLog`; tests pass a no-op/spy.
 */
export type AuditLogger = (input: AuditLogInput) => Promise<void>

/**
 * Domain type for `database/migrations/0013_audit.sql#security_events` —
 * events with no resolved actor/entity (a failed login, a denied
 * permission check) rather than a structural change to a named entity,
 * which is what `audit_logs` is for. See `recordSecurityEvent`
 * (`modules/audit/application/audit.service.ts`).
 */
export type SecurityEventInput = {
  actorUserId: string | null
  eventType: 'LOGIN_FAILURE' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY'
  ipAddress?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown>
}

/** Read shape for `GET /api/v1/audit-logs` (Admin Shell's Audit Logs screen). */
export type AuditLogRecord = {
  id: string
  actorUserId: string | null
  organizationId: string | null
  websiteId: string | null
  action: string
  entityType: string
  entityId: string | null
  requestId: string | null
  source: string
  success: boolean
  reason: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

/** Read shape for `GET /api/v1/audit-logs/security-events`. */
export type SecurityEventRecord = {
  id: string
  actorUserId: string | null
  eventType: string
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

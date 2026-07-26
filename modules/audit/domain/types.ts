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

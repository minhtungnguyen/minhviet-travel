import { hasPermission, type ActorContext } from '@/shared/auth/session'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'

/**
 * Server-side gate for an Admin Shell page's content — matches ANY
 * permission in the list. This is the "Unauthorized state" required by
 * Phase 5; it does not replace `requirePermission()` inside the actual
 * mutation (Server Action / API route), only guards what's rendered.
 */
export function RequirePermission({
  actor,
  permission,
  children,
}: {
  actor: ActorContext
  permission: string | string[]
  children: React.ReactNode
}) {
  const required = Array.isArray(permission) ? permission : [permission]
  const allowed = required.some((p) => hasPermission(actor, p))
  if (!allowed) return <AdminUnauthorized />
  return <>{children}</>
}

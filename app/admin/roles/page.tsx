import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'

export const metadata: Metadata = { title: 'Roles & Permissions | Minh Việt Travel Admin' }

export default async function AdminRolesPage() {
  const actor = await resolveActor()
  if (!hasPermission(actor, 'role.manage')) {
    return <AdminUnauthorized />
  }

  const service = new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
  const [roles, permissions, pairs] = await Promise.all([
    service.listRoles(),
    service.listPermissions(),
    service.listRolePermissionPairs(),
  ])

  const grantSet = new Set(pairs.map((p) => `${p.roleId}:${p.permissionId}`))
  const sortedRoles = [...roles].sort((a, b) => a.name.localeCompare(b.name))
  const sortedPermissions = [...permissions].sort((a, b) => a.key.localeCompare(b.key))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Roles & Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {roles.length} vai trò · {permissions.length} quyền. Đọc trực tiếp từ dữ liệu thật, không chỉnh sửa từ màn hình này ở V1.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="sticky left-0 bg-secondary/40 px-4 py-3 text-left">Permission</th>
              {sortedRoles.map((r) => (
                <th key={r.id} className="px-3 py-3 text-center whitespace-nowrap">
                  {r.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedPermissions.map((p) => (
              <tr key={p.id}>
                <td className="sticky left-0 bg-card px-4 py-2 font-mono text-xs text-foreground">{p.key}</td>
                {sortedRoles.map((r) => (
                  <td key={r.id} className="px-3 py-2 text-center">
                    {grantSet.has(`${r.id}:${p.id}`) ? <span className="text-primary">✓</span> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

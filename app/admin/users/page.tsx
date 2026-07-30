import Link from 'next/link'
import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AccessControlService } from '@/modules/access-control/application/access-control.service'
import { SupabaseAccessControlRepository } from '@/modules/access-control/infrastructure/access-control.repository'
import { lookupAuthEmails } from '@/modules/access-control/infrastructure/auth-email-lookup'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { paginationQuerySchema } from '@/shared/validation/pagination'

export const metadata: Metadata = { title: 'Users | Minh Việt Travel Admin' }

const STATUS_LABEL: Record<string, string> = {
  INVITED: 'Đã mời',
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm khoá',
  DISABLED: 'Vô hiệu hoá',
  TERMINATED: 'Đã chấm dứt',
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const actor = await resolveActor()

  if (!hasPermission(actor, 'user.manage')) {
    return <AdminUnauthorized />
  }

  const query = paginationQuerySchema.parse({ page: params.page, search: params.search, pageSize: 20 })
  const service = new AccessControlService(new SupabaseAccessControlRepository(await getServerSupabaseClient()), recordAuditLog)
  const result = await service.listUsers(actor, query)
  const emails = await lookupAuthEmails(result.items.map((u) => u.id))
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">{result.total} tài khoản.</p>
      </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tên hiển thị</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Đăng nhập gần nhất</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.items.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{u.displayName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emails.get(u.id) || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {STATUS_LABEL[u.accountStatus] ?? u.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('vi-VN') : 'Chưa từng đăng nhập'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-primary hover:underline">
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
              {result.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Không có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Trang {result.page} / {totalPages}
            </span>
            <div className="flex gap-2">
              {result.page > 1 && (
                <Link href={`/admin/users?page=${result.page - 1}`} className="rounded-lg border border-border px-3 py-1.5 hover:bg-secondary/60">
                  Trước
                </Link>
              )}
              {result.page < totalPages && (
                <Link href={`/admin/users?page=${result.page + 1}`} className="rounded-lg border border-border px-3 py-1.5 hover:bg-secondary/60">
                  Sau
                </Link>
              )}
            </div>
          </div>
        )}
    </div>
  )
}

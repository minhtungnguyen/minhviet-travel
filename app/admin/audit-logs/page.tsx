import type { Metadata } from 'next'
import Link from 'next/link'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { AuditQueryService } from '@/modules/audit/application/audit-query.service'
import { SupabaseAuditQueryRepository } from '@/modules/audit/infrastructure/audit-query.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { paginationQuerySchema } from '@/shared/validation/pagination'

export const metadata: Metadata = { title: 'Audit Logs | Minh Việt Travel Admin' }

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>
}) {
  const params = await searchParams
  const actor = await resolveActor()
  if (!hasPermission(actor, 'audit.read')) {
    return <AdminUnauthorized />
  }

  const tab = params.tab === 'security' ? 'security' : 'audit'
  const query = paginationQuerySchema.parse({ page: params.page, pageSize: 30, order: 'desc' })
  const service = new AuditQueryService(new SupabaseAuditQueryRepository(await getServerSupabaseClient()))

  const auditResult = tab === 'audit' ? await service.listAuditLogs(actor, query) : null
  const securityResult = tab === 'security' ? await service.listSecurityEvents(actor, query) : null
  const total = auditResult?.total ?? securityResult?.total ?? 0
  const isEmpty = (auditResult?.items.length ?? securityResult?.items.length ?? 0) === 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} bản ghi.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <Link
          href="/admin/audit-logs?tab=audit"
          className={`px-3 py-2 text-sm font-medium ${tab === 'audit' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
        >
          Hoạt động
        </Link>
        <Link
          href="/admin/audit-logs?tab=security"
          className={`px-3 py-2 text-sm font-medium ${tab === 'security' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
        >
          Sự kiện bảo mật
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              {auditResult ? (
                <>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Đối tượng</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Kết quả</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Loại sự kiện</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">IP</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditResult?.items.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{log.action}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {log.entityType}
                  {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ''}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{log.actorUserId ? log.actorUserId.slice(0, 8) : 'hệ thống'}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      log.success
                        ? 'rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary'
                        : 'rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive'
                    }
                  >
                    {log.success ? 'Thành công' : 'Thất bại'}
                  </span>
                </td>
              </tr>
            ))}
            {securityResult?.items.map((evt) => (
              <tr key={evt.id}>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(evt.createdAt).toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{evt.eventType}</td>
                <td className="px-4 py-3 text-muted-foreground">{evt.actorUserId ? evt.actorUserId.slice(0, 8) : '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{evt.ipAddress ?? '—'}</td>
              </tr>
            ))}
            {isEmpty && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có bản ghi nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

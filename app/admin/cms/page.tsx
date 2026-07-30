import Link from 'next/link'
import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { paginationQuerySchema } from '@/shared/validation/pagination'

export const metadata: Metadata = { title: 'Website CMS | Minh Việt Travel Admin' }

export default async function AdminCmsPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ websiteId?: string; page?: string }>
}) {
  const params = await searchParams
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const { data: websites } = await supabase
    .from('websites')
    .select('id, name, domain')
    .is('deleted_at', null)
    .order('created_at')

  const websiteId = params.websiteId ?? websites?.[0]?.id
  const service = new CmsService(new SupabaseCmsRepository(supabase), supabase, recordAuditLog)
  const query = paginationQuerySchema.parse({ page: params.page, pageSize: 20 })
  const result = websiteId
    ? await service.listPages(actor, websiteId, query)
    : { items: [], page: 1, pageSize: 20, total: 0 }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Website CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} trang. Đây là màn hình biên soạn cấu trúc trang (Homepage Builder) — chưa kết nối vào trang chủ công khai.
          </p>
        </div>
        {websites && websites.length > 1 && (
          <form className="flex items-center gap-2">
            <select name="websiteId" defaultValue={websiteId} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/60">
              Đổi website
            </button>
          </form>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Loại trang</th>
              <th className="px-4 py-3">Locale</th>
              <th className="px-4 py-3">Cập nhật</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-foreground">/{p.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.pageType}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.locale}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/cms/${p.id}`} className="font-medium text-primary hover:underline">
                    Chỉnh sửa
                  </Link>
                </td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có trang nào cho website này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

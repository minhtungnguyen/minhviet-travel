import Link from 'next/link'
import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { paginationQuerySchema } from '@/shared/validation/pagination'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'

export const metadata: Metadata = { title: 'Tin tức | Minh Việt Travel Admin' }

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ websiteId?: string; page?: string }> }) {
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
  const query = paginationQuerySchema.parse({ page: params.page, pageSize: 20, search: NEWS_SLUG_PREFIX })
  const result = websiteId
    ? await service.listPages(actor, websiteId, query)
    : { items: [], page: 1, pageSize: 20, total: 0 }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tin tức</h1>
          <p className="mt-1 text-sm text-muted-foreground">{result.total} bài viết.</p>
        </div>
        {hasPermission(actor, 'cms.page.create') && (
          <Link href="/admin/news/new" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-deep">
            Viết bài mới
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Locale</th>
              <th className="px-4 py-3">Cập nhật</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-foreground">/{p.slug.slice(NEWS_SLUG_PREFIX.length)}</td>
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
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { DuplicatePageButton } from '@/components/admin/duplicate-page-button'
import { paginationQuerySchema } from '@/shared/validation/pagination'
import type { CmsLifecycleStatus, CmsPageType } from '@/modules/cms/domain/types'

export const metadata: Metadata = { title: 'Website CMS | Minh Việt Travel Admin' }

const PAGE_TYPES: CmsPageType[] = [
  'HOME', 'SERVICE_HUB', 'LANDING_PAGE', 'STATIC_PAGE', 'PROGRAM_INSPIRATION',
  'ARTICLE_INDEX', 'PRODUCT_INDEX', 'CONTACT', 'POLICY', 'CUSTOM',
]
const STATUSES: CmsLifecycleStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']
const STATUS_LABEL: Record<CmsLifecycleStatus, string> = {
  DRAFT: 'Bản nháp',
  IN_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  SCHEDULED: 'Đã lên lịch',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Đã lưu trữ',
}

export default async function AdminCmsPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ websiteId?: string; page?: string; search?: string; pageType?: string; status?: string }>
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
  const query = paginationQuerySchema.parse({ page: params.page, pageSize: 20, search: params.search })
  const filters = {
    pageType: (params.pageType as CmsPageType) || undefined,
    status: (params.status as CmsLifecycleStatus) || undefined,
  }
  const result = websiteId
    ? await service.listPages(actor, websiteId, query, filters)
    : { items: [], page: 1, pageSize: 20, total: 0 }

  const statusByPageId = new Map(
    await Promise.all(
      result.items.map(async (p) => {
        const versions = await service.listVersions(actor, p.id)
        return [p.id, versions[0]?.status ?? null] as const
      }),
    ),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Website CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">{result.total} trang. Quản lý trang, nội dung và workflow xuất bản.</p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission(actor, 'cms.page.publish') && (
            <Link href="/admin/cms/scheduler" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/60">
              Lịch xuất bản
            </Link>
          )}
          {hasPermission(actor, 'cms.page.create') && (
            <Link href="/admin/cms/new" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-deep">
              Tạo trang mới
            </Link>
          )}
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2">
        {websites && websites.length > 1 && (
          <select name="websiteId" defaultValue={websiteId} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {websites.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.domain})
              </option>
            ))}
          </select>
        )}
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Tìm theo slug..."
          className="h-10 min-w-48 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <select name="pageType" defaultValue={params.pageType ?? ''} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
          <option value="">Mọi loại trang</option>
          {PAGE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ''} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
          <option value="">Mọi trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/60">
          Lọc
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Loại trang</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Locale</th>
              <th className="px-4 py-3">Cập nhật</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.items.map((p) => {
              const status = statusByPageId.get(p.id)
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-foreground">/{p.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.pageType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{status ? STATUS_LABEL[status] : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.locale}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/cms/${p.id}`} className="font-medium text-primary hover:underline">
                        Chỉnh sửa
                      </Link>
                      {hasPermission(actor, 'cms.page.create') && <DuplicatePageButton pageId={p.id} />}
                    </div>
                  </td>
                </tr>
              )
            })}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Không có trang nào khớp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

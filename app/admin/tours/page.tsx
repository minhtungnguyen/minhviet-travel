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
import { TOUR_SLUG_PREFIX } from '@/lib/cms/tour-constants'
import type { CmsLifecycleStatus } from '@/modules/cms/domain/types'

export const metadata: Metadata = { title: 'Tours | Minh Việt Travel Admin' }

const STATUSES: CmsLifecycleStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']
const STATUS_LABEL: Record<CmsLifecycleStatus, string> = {
  DRAFT: 'Bản nháp',
  IN_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  SCHEDULED: 'Đã lên lịch',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Đã lưu trữ',
}

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{ websiteId?: string; page?: string; search?: string; status?: string }>
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

  // Same mechanism as News (app/admin/news/page.tsx): the slug-prefix
  // anchor and a free-text search term can't both be expressed by the
  // repository's single generic `search` param, so resolve matching page
  // ids here instead.
  let pageIds: string[] = []
  if (websiteId) {
    let idQuery = supabase.from('cms_pages').select('id').eq('website_id', websiteId).is('deleted_at', null).like('slug', `${TOUR_SLUG_PREFIX}%`)
    if (params.search) idQuery = idQuery.ilike('slug', `%${params.search}%`)
    const { data: matchingPages } = await idQuery
    pageIds = (matchingPages ?? []).map((p) => p.id)
  }

  const filters = { status: (params.status as CmsLifecycleStatus) || undefined, pageIds }
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
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))

  function pageHref(p: number) {
    const sp = new URLSearchParams()
    if (params.search) sp.set('search', params.search)
    if (params.status) sp.set('status', params.status)
    if (params.websiteId) sp.set('websiteId', params.websiteId)
    sp.set('page', String(p))
    return `/admin/tours?${sp.toString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tours</h1>
          <p className="mt-1 text-sm text-muted-foreground">{result.total} tour.</p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission(actor, 'cms.page.create') && (
            <Link href="/admin/tours/new" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-deep">
              Tạo tour mới
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
          placeholder="Tìm theo slug tour..."
          className="h-10 min-w-48 rounded-lg border border-border bg-background px-3 text-sm"
        />
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
                  <td className="px-4 py-3 font-medium text-foreground">/{p.slug.slice(TOUR_SLUG_PREFIX.length)}</td>
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
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Không có tour nào khớp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium ${
                p === result.page ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-secondary/60'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

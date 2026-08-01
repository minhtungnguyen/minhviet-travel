import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { SeoService } from '@/modules/seo/application/seo.service'
import { SupabaseSeoRepository } from '@/modules/seo/infrastructure/seo.repository'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { SeoMetadataForm } from '@/components/admin/seo-metadata-form'
import { paginationQuerySchema } from '@/shared/validation/pagination'

export const metadata: Metadata = { title: 'SEO | Minh Việt Travel Admin' }

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const HOME_PAGE_ID = '00000000-0000-4000-8000-000000000100'

/**
 * Phase 4: gone from "the homepage's SEO metadata, hardcoded" (Sprint 2) to
 * "pick any cms_page on this website" — same seo_metadata table/API, just
 * an entity picker instead of one fixed constant. Every future content
 * type (News is already a cms_page) works through this same screen with
 * no further change here.
 */
export default async function AdminSeoPage({ searchParams }: { searchParams: Promise<{ entityId?: string }> }) {
  const params = await searchParams
  const actor = await resolveActor()
  const canWrite = hasPermission(actor, 'seo.metadata.update')
  if (!canWrite) {
    return <AdminUnauthorized />
  }

  const client = await getServerSupabaseClient()
  const seoService = new SeoService(new SupabaseSeoRepository(client), client, () => Promise.resolve())
  const cmsService = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)

  const query = paginationQuerySchema.parse({ pageSize: 100, sort: 'created_at' })
  const pages = await cmsService.listPages(actor, WEBSITE_ID, query)
  const entityId = params.entityId ?? HOME_PAGE_ID
  const selectedPage = pages.items.find((p) => p.id === entityId)

  const currentMetadata = await seoService.getMetadata(WEBSITE_ID, 'cms_page', entityId, selectedPage?.locale ?? 'vi').catch(() => null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">SEO</h1>
        <p className="mt-1 text-sm text-muted-foreground">Meta title, description và chỉ số index/follow cho từng trang.</p>
      </div>

      <form className="flex items-center gap-2">
        <select name="entityId" defaultValue={entityId} className="h-10 min-w-64 rounded-lg border border-border bg-background px-3 text-sm">
          {pages.items.map((p) => (
            <option key={p.id} value={p.id}>
              /{p.slug}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/60">
          Chọn trang
        </button>
      </form>

      {selectedPage || entityId === HOME_PAGE_ID ? (
        <SeoMetadataForm
          metadata={currentMetadata}
          identity={{
            websiteId: WEBSITE_ID,
            entityType: 'cms_page',
            entityId,
            locale: selectedPage?.locale ?? 'vi',
            defaultSlug: selectedPage?.slug ?? 'home',
            defaultTitle: selectedPage?.slug ?? 'Trang chủ',
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Không tìm thấy trang đã chọn.</p>
      )}
    </div>
  )
}

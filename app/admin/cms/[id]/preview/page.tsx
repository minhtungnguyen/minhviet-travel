import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { CmsGenericPageRenderer } from '@/components/site/cms-generic-page-renderer'

export const metadata: Metadata = { title: 'Xem trước | Minh Việt Travel Admin' }

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Bản nháp',
  IN_REVIEW: 'Đang duyệt',
  APPROVED: 'Đã duyệt',
  SCHEDULED: 'Đã lên lịch',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Đã lưu trữ',
}

/** Renders the page's latest version regardless of status — the public site (app/[slug]/page.tsx) only ever shows PUBLISHED + is_current. */
export default async function CmsPagePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(supabase), supabase, recordAuditLog)
  const result = await service.getPreviewContent(actor, id).catch(() => null)
  if (!result) notFound()

  const { version, sections } = result
  const definitions = await service.listBlockDefinitions()
  const keyById = new Map(definitions.map((d) => [d.id, d.key]))

  return (
    <div>
      <div className="sticky top-0 z-50 bg-gold px-4 py-2 text-center text-sm font-semibold text-deep">
        Xem trước — {STATUS_LABEL[version.status] ?? version.status}, chưa chắc đã hiển thị công khai
      </div>
      <SiteChrome>
        <PageHero eyebrow="Xem trước" title={version.title} breadcrumb={version.title} />
        <CmsGenericPageRenderer sections={sections} blockDefinitionKeyById={keyById} />
      </SiteChrome>
    </div>
  )
}

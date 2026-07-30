import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { CmsPageEditor } from '@/components/admin/cms-page-editor'

export const metadata: Metadata = { title: 'Chỉnh sửa trang | Minh Việt Travel Admin' }

export default async function AdminCmsPageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(supabase), supabase, recordAuditLog)

  const [page, versions, sections, blockDefinitions] = await Promise.all([
    service.getPage(id),
    service.listVersions(actor, id),
    service.listSections(actor, id),
    service.listBlockDefinitions(),
  ])
  const currentVersion = versions[0] ?? null

  const sectionsWithBlocks = await Promise.all(
    sections
      .sort((a, b) => a.position - b.position)
      .map(async (section) => ({
        section,
        blocks: (await service.listBlocks(actor, section.id)).sort((a, b) => a.position - b.position),
      })),
  )

  return (
    <CmsPageEditor
      page={page}
      currentVersion={currentVersion}
      sectionsWithBlocks={sectionsWithBlocks}
      blockDefinitions={blockDefinitions}
      canUpdate={hasPermission(actor, 'cms.page.update')}
      canPublish={hasPermission(actor, 'cms.page.publish')}
    />
  )
}

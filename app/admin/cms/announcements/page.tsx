import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { AnnouncementsPanel } from '@/components/admin/announcements-panel'

export const metadata: Metadata = { title: 'Popup / Thông báo | Minh Việt Travel Admin' }

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ websiteId?: string }>
}) {
  const params = await searchParams
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.announcement.update') && !hasPermission(actor, 'cms.page.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const { data: websites } = await supabase
    .from('websites')
    .select('id, name')
    .is('deleted_at', null)
    .order('created_at')
  const websiteId = params.websiteId ?? websites?.[0]?.id

  const service = new CmsService(new SupabaseCmsRepository(supabase), supabase, recordAuditLog)
  const announcements = websiteId ? await service.listAnnouncements(websiteId) : []

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Popup / Thông báo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản trị nội dung banner/thông báo hiển thị trên website — dùng chung schema `announcements` đã có sẵn.
        </p>
      </div>
      {websiteId ? (
        <AnnouncementsPanel
          websiteId={websiteId}
          announcements={announcements}
          canWrite={hasPermission(actor, 'cms.announcement.update')}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Chưa có website nào.</p>
      )}
    </div>
  )
}

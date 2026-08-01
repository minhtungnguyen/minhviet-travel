import type { Metadata } from 'next'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { SchedulerPanel } from '@/components/admin/scheduler-panel'

export const metadata: Metadata = { title: 'Lịch xuất bản | Minh Việt Travel Admin' }

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'

/**
 * Scheduler V1 — manual due-item processing only (Founder decision:
 * no Vercel Cron, no pg_cron in Phase 4). An admin opens this screen,
 * sees how many SCHEDULED versions are due, and explicitly triggers the
 * publish batch. Automated scheduling is deferred to a later phase.
 */
export default async function AdminCmsSchedulerPage() {
  const actor = await resolveActor()
  if (!hasPermission(actor, 'cms.page.publish')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(supabase), supabase, recordAuditLog)
  const preview = await service.previewScheduledPublish(actor, WEBSITE_ID)

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Lịch xuất bản</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CMS Scheduler V1 dùng xử lý thủ công theo nội dung đến hạn (manual due-item processing). Tự động hoá theo lịch (cron) chưa triển
          khai ở phase này.
        </p>
      </div>
      <SchedulerPanel websiteId={WEBSITE_ID} initialDue={preview.due} initialNotDueYet={preview.notDueYet} />
    </div>
  )
}

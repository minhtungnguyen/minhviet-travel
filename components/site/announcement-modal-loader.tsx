import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { AnnouncementModal } from '@/components/site/announcement-modal'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'

/**
 * Sprint 2 ("Popup management"): server-side fetch of the real active
 * announcement, replacing what used to be 100% hardcoded copy in
 * `AnnouncementModal`. `CmsService.listAnnouncements` takes no actor —
 * it's genuinely anonymous, and RLS (`announcements`: anon read only
 * when `status='ACTIVE'` and inside `[starts_at, ends_at]`) is the real
 * filter, matching the same defense-in-depth pattern as every other
 * public content read in this codebase.
 */
export async function AnnouncementModalLoader() {
  const client = getPublicSupabaseClient()
  const service = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const announcements = await service.listAnnouncements(WEBSITE_ID)
  const active = announcements.find((a) => a.status === 'ACTIVE')
  if (!active) return null

  return <AnnouncementModal message={active.message} linkHref={active.linkHref} />
}

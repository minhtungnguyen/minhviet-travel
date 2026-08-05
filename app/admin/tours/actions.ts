'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'
import { TOUR_SLUG_PREFIX } from '@/lib/cms/tour-constants'

export type CreateTourResult = { ok: true; pageId: string } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

/**
 * Creates the page + first DRAFT version + three sections:
 * - `content` (RICH_TEXT, empty body) — the tour's overview text, reuses
 *   RichTextBlockForm as-is (same section-key convention as News),
 *   required non-empty before publish (requireContentBodyBeforePublish
 *   in app/admin/cms/actions.ts).
 * - `itinerary` (TIMELINE, {days: []}) — day-by-day plan, edited via
 *   TourItineraryBlockForm.
 * - `policy` (CUSTOM, {inclusions: [], exclusions: [], cancellationNote:
 *   ''}) — edited via TourPolicyBlockForm.
 * Categories/destinations (Phase 3 taxonomy), the gallery (Phase 5), and
 * departures (Phase 4) are added after creation, on the shared editor at
 * /admin/cms/{id} — same flow News uses.
 */
export async function createTourAction(input: {
  websiteId: string
  locale: 'vi' | 'en' | 'zh' | 'ko' | 'ja'
  title: string
  slugSuffix: string
}): Promise<CreateTourResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const requestId = newRequestId()
    const { page } = await service.createPageWithDraftVersion(
      actor,
      { websiteId: input.websiteId, locale: input.locale, pageType: 'TOUR', slug: `${TOUR_SLUG_PREFIX}${input.slugSuffix}` },
      input.title,
      requestId,
    )
    const contentSection = await service.createSection(actor, page.id, 'content', 0, requestId)
    await service.createBlock(actor, contentSection.id, 'RICH_TEXT', 0, { body: '' }, requestId)
    const itinerarySection = await service.createSection(actor, page.id, 'itinerary', 1, requestId)
    await service.createBlock(actor, itinerarySection.id, 'TIMELINE', 0, { days: [] }, requestId)
    const policySection = await service.createSection(actor, page.id, 'policy', 2, requestId)
    await service.createBlock(actor, policySection.id, 'CUSTOM', 0, { inclusions: [], exclusions: [], cancellationNote: '' }, requestId)
    revalidatePath('/admin/tours')
    revalidatePath('/tours')
    return { ok: true, pageId: page.id }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { TourCategoryService } from '@/modules/tour-categories/application/tour-category.service'
import { SupabaseTourCategoryRepository } from '@/modules/tour-categories/infrastructure/tour-category.repository'
import { TourDestinationService } from '@/modules/tour-destinations/application/tour-destination.service'
import { SupabaseTourDestinationRepository } from '@/modules/tour-destinations/infrastructure/tour-destination.repository'
import { newRequestId } from '@/shared/http/request-id'

export type ActionResult = { ok: true } | { ok: false; message: string }

/** Called from the shared editor (/admin/cms/{id}) when the page is a Tour — assigns its full category set (many-to-many, unlike News' one-category rule). */
export async function assignTourCategoriesAction(pageId: string, categoryIds: string[], websiteId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const client = await getServerSupabaseClient()
    const service = new TourCategoryService(new SupabaseTourCategoryRepository(client), client, recordAuditLog)
    await service.assignTourCategories(actor, pageId, categoryIds, websiteId, newRequestId())
    revalidatePath(`/admin/cms/${pageId}`)
    revalidatePath('/tours')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

/** Assigns which destinations (existing master-data table) a Tour visits, in itinerary order. */
export async function assignTourDestinationsAction(pageId: string, destinationIds: string[], websiteId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const client = await getServerSupabaseClient()
    const service = new TourDestinationService(new SupabaseTourDestinationRepository(client), client, recordAuditLog)
    await service.assignTourDestinations(actor, pageId, destinationIds, websiteId, newRequestId())
    revalidatePath(`/admin/cms/${pageId}`)
    revalidatePath('/tours')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

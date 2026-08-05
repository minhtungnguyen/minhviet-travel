'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { TourDepartureService } from '@/modules/tour-departures/application/tour-departure.service'
import { SupabaseTourDepartureRepository } from '@/modules/tour-departures/infrastructure/tour-departure.repository'
import { newRequestId } from '@/shared/http/request-id'
import type { TourDepartureCreateInput, TourDepartureUpdateInput } from '@/modules/tour-departures/schemas/tour-departure.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new TourDepartureService(new SupabaseTourDepartureRepository(client), client, recordAuditLog)
}

export async function createTourDepartureAction(input: TourDepartureCreateInput, websiteId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.create(actor, input, websiteId, newRequestId())
    revalidatePath(`/admin/cms/${input.pageId}`)
    revalidatePath('/tours')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function updateTourDepartureAction(
  id: string,
  pageId: string,
  input: TourDepartureUpdateInput,
  websiteId: string,
): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.update(actor, id, input, websiteId, newRequestId())
    revalidatePath(`/admin/cms/${pageId}`)
    revalidatePath('/tours')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function deleteTourDepartureAction(id: string, pageId: string, websiteId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.delete(actor, id, websiteId, newRequestId())
    revalidatePath(`/admin/cms/${pageId}`)
    revalidatePath('/tours')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

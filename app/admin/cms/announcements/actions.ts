'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'
import type { AnnouncementCreateInput, AnnouncementUpdateInput } from '@/modules/cms/schemas/cms.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

export async function createAnnouncementAction(input: AnnouncementCreateInput): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.createAnnouncement(actor, input, newRequestId())
    revalidatePath('/admin/cms/announcements')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function updateAnnouncementAction(id: string, input: AnnouncementUpdateInput): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.updateAnnouncement(actor, id, input, newRequestId())
    revalidatePath('/admin/cms/announcements')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.deleteAnnouncement(actor, id, newRequestId())
    revalidatePath('/admin/cms/announcements')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

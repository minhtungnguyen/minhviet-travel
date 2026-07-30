'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { MediaService } from '@/modules/media/application/media.service'
import { SupabaseMediaRepository } from '@/modules/media/infrastructure/media.repository'
import { newRequestId } from '@/shared/http/request-id'
import type { MediaAssetUpdateInput } from '@/modules/media/schemas/media.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new MediaService(new SupabaseMediaRepository(client), client, recordAuditLog)
}

export async function createFolderAction(name: string, parentFolderId?: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.createFolder(actor, { name, parentFolderId }, newRequestId())
    revalidatePath('/admin/media')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function updateAssetAction(id: string, input: MediaAssetUpdateInput): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    await service.updateAsset(actor, id, input, newRequestId())
    revalidatePath('/admin/media')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

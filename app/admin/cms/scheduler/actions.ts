'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'

export type RunSchedulerResult =
  | { ok: true; published: number; notDueYet: number; errors: { versionId: string; message: string }[] }
  | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

export async function runSchedulerAction(websiteId: string): Promise<RunSchedulerResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const result = await service.runScheduledPublish(actor, websiteId, newRequestId())
    revalidatePath('/admin/cms')
    revalidatePath('/admin/cms/scheduler')
    return { ok: true, ...result }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

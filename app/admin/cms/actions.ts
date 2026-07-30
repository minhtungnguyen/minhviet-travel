'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'

export type ActionResult = { ok: true } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

function wrap(fn: () => Promise<unknown>, pageId: string): Promise<ActionResult> {
  return fn()
    .then(() => {
      revalidatePath(`/admin/cms/${pageId}`)
      return { ok: true as const }
    })
    .catch((error) => ({ ok: false as const, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }))
}

export async function submitForReviewAction(pageId: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.submitPageForReview(actor, pageId, newRequestId()), pageId)
}

export async function approvePageAction(pageId: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.approvePage(actor, pageId, newRequestId()), pageId)
}

export async function publishPageAction(pageId: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.publishPage(actor, pageId, {}, newRequestId()), pageId)
}

export async function archivePageAction(pageId: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.archivePage(actor, pageId, newRequestId()), pageId)
}

/** Reorders a section by swapping `position` with its neighbor. */
export async function moveSectionAction(pageId: string, sectionId: string, newPosition: number): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.updateSection(actor, sectionId, { position: newPosition }, newRequestId()), pageId)
}

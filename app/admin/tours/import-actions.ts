'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { AiImportService } from '@/modules/ai-import/application/ai-import.service'
import { SupabaseAiImportRepository } from '@/modules/ai-import/infrastructure/ai-import.repository'
import { AnthropicTourImportProvider } from '@/integrations/ai/providers/anthropic-tour-import-provider'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'
import { importJobCreateSchema } from '@/modules/ai-import/schemas/ai-import.schema'
import type { ImportJob } from '@/modules/ai-import/domain/types'

export type ImportActionResult = { ok: true; job: ImportJob } | { ok: false; message: string }
export type ApproveActionResult = { ok: true; pageId: string } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  const cms = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  return new AiImportService(new SupabaseAiImportRepository(client), new AnthropicTourImportProvider(), cms, client, recordAuditLog)
}

export async function createImportJobAction(input: { websiteId: string; sourceMediaAssetId: string }): Promise<ImportActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const requestId = newRequestId()
    const parsed = importJobCreateSchema.parse({ ...input, entityType: 'tour' })
    const job = await service.createJob(actor, parsed, requestId)
    revalidatePath('/admin/tours/import')
    return { ok: true, job }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function runImportJobAction(jobId: string): Promise<ImportActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const job = await service.runJob(actor, jobId, newRequestId())
    revalidatePath('/admin/tours/import')
    revalidatePath(`/admin/tours/import/${jobId}`)
    return { ok: true, job }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function approveImportDraftAction(jobId: string, websiteId: string): Promise<ApproveActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const { pageId } = await service.approveDraft(actor, jobId, websiteId, 'vi', newRequestId())
    revalidatePath('/admin/tours/import')
    revalidatePath('/admin/tours')
    revalidatePath('/tours')
    return { ok: true, pageId }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function rejectImportJobAction(jobId: string): Promise<ImportActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const job = await service.rejectJob(actor, jobId, newRequestId())
    revalidatePath('/admin/tours/import')
    return { ok: true, job }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

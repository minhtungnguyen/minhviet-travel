'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { SeoService } from '@/modules/seo/application/seo.service'
import { SupabaseSeoRepository } from '@/modules/seo/infrastructure/seo.repository'
import { newRequestId } from '@/shared/http/request-id'
import { seoMetadataPutSchema, type SeoMetadataPutInput } from '@/modules/seo/schemas/seo.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }

export async function updateSeoMetadataAction(
  entityType: string,
  entityId: string,
  input: SeoMetadataPutInput,
): Promise<ActionResult> {
  try {
    const parsed = seoMetadataPutSchema.parse(input)
    const actor = await resolveActor()
    const client = await getServerSupabaseClient()
    const service = new SeoService(new SupabaseSeoRepository(client), client, recordAuditLog)
    await service.putMetadata(actor, entityType, entityId, parsed, newRequestId())
    revalidatePath('/admin/seo')
    revalidatePath('/')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Dữ liệu SEO không hợp lệ.' }
  }
}

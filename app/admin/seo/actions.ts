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
    const metadata = await service.putMetadata(actor, entityType, entityId, parsed, newRequestId())
    // `cms_page_versions.seo_metadata_id` is what the public site's
    // `generateMetadata()` actually reads (see app/tin-tuc/[slug]/page.tsx
    // and the generic Pages equivalent) — `seo_metadata` itself is a single
    // upserted row per entity+locale, not versioned, so every version of
    // this page shares the same pointer.
    if (entityType === 'cms_page') {
      await client.from('cms_page_versions').update({ seo_metadata_id: metadata.id }).eq('page_id', entityId)
    }
    revalidatePath('/admin/seo')
    revalidatePath('/admin/cms')
    revalidatePath('/admin/news')
    revalidatePath('/')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Dữ liệu SEO không hợp lệ.' }
  }
}

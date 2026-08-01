'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'
import type { CmsPageCreateInput } from '@/modules/cms/schemas/cms.schema'

export type ActionResult = { ok: true } | { ok: false; message: string }
export type CreatePageResult = { ok: true; pageId: string } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

/**
 * `home` is the one real public route today (`app/page.tsx`); every
 * News article added in a later increment reuses this same `slug ->
 * public path` convention (`brand/news/<slug>` already matches its own
 * URL 1:1) so this switch only needs new cases, never new plumbing.
 */
function publicPathForSlug(slug: string): string {
  if (slug === 'home') return '/'
  return `/${slug}`
}

/**
 * The homepage's single cms_page_version is already `PUBLISHED` (seeded
 * that way) — editing its sections/blocks therefore takes effect on the
 * live site immediately, the same as an explicit "publish" action would.
 * Every content-mutating action here revalidates the real public path,
 * not just `publishPageAction`, so "Lưu" in the Admin editor is never
 * silently stale on the live page (Next's ISR cache for `/` would
 * otherwise only refresh after `export const revalidate = 300`).
 */
async function wrap(fn: () => Promise<unknown>, pageId: string): Promise<ActionResult> {
  try {
    await fn()
    revalidatePath(`/admin/cms/${pageId}`)
    const service = await getService()
    const page = await service.getPage(pageId)
    revalidatePath(publicPathForSlug(page.slug))
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

export async function createPageAction(input: CmsPageCreateInput, title: string): Promise<CreatePageResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const { page } = await service.createPageWithDraftVersion(actor, input, title, newRequestId())
    revalidatePath('/admin/cms')
    return { ok: true, pageId: page.id }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

/** Soft-delete (deleted_at) — distinct from "Lưu trữ" (archive a version's lifecycle status); this removes the whole page. */
export async function deletePageAction(pageId: string): Promise<ActionResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const page = await service.getPage(pageId)
    await service.deletePage(actor, pageId, newRequestId())
    revalidatePath('/admin/cms')
    revalidatePath(publicPathForSlug(page.slug))
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
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

/** Real per-block-type edit forms (HeroBlockForm etc.) call this instead of hand-editing JSON. */
export async function updateBlockConfigAction(
  pageId: string,
  blockId: string,
  config: Record<string, unknown>,
): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.updateBlock(actor, blockId, { config }, newRequestId()), pageId)
}

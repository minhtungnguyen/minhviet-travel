'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'
import { NewsCategoryService } from '@/modules/news-categories/application/news-category.service'
import { SupabaseNewsCategoryRepository } from '@/modules/news-categories/infrastructure/news-category.repository'
import type { CmsPageCreateInput } from '@/modules/cms/schemas/cms.schema'
import type { ActorContext } from '@/shared/auth/guards'

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

export async function checkSlugAvailableAction(websiteId: string, locale: string, slug: string): Promise<{ available: boolean | null }> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const available = await service.isSlugAvailable(actor, websiteId, locale, slug)
    return { available }
  } catch {
    return { available: null }
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

/**
 * News articles have no dedicated "is this a news page" flag — the
 * slug prefix convention (`lib/cms/news.ts`) is the only signal. Body
 * lives in the `content` section's RICH_TEXT block (see
 * createNewsArticleAction); a News page can't go live with it empty.
 */
async function requireNewsBodyBeforePublish(actor: ActorContext, service: CmsService, pageId: string): Promise<string | null> {
  const page = await service.getPage(pageId)
  if (!page.slug.startsWith(NEWS_SLUG_PREFIX)) return null
  const sections = await service.listSections(actor, pageId)
  const contentSection = sections.find((s) => s.sectionKey === 'content')
  const blocks = contentSection ? await service.listBlocks(actor, contentSection.id) : []
  const body = (blocks[0]?.config as { body?: string } | undefined)?.body ?? ''
  return body.trim() ? null : 'Bài viết cần có nội dung (phần thân bài) trước khi xuất bản.'
}

export async function publishPageAction(pageId: string, scheduledPublishAt?: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  const bodyError = await requireNewsBodyBeforePublish(actor, service, pageId)
  if (bodyError) return { ok: false, message: bodyError }
  return wrap(() => service.publishPage(actor, pageId, scheduledPublishAt ? { scheduledPublishAt } : {}, newRequestId()), pageId)
}

export async function unpublishPageAction(pageId: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  return wrap(() => service.unpublishPage(actor, pageId, newRequestId()), pageId)
}

export async function duplicatePageAction(pageId: string): Promise<CreatePageResult> {
  try {
    const actor = await resolveActor()
    const client = await getServerSupabaseClient()
    const service = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
    const newPage = await service.duplicatePage(actor, pageId, newRequestId())
    // News articles are `cms_pages` with the `tin-tuc/` slug prefix (see
    // NEWS_SLUG_PREFIX) but their category lives in a separate relational
    // table (news_article_categories, not a cms_sections/cms_blocks row),
    // so the generic duplicatePage() above never sees it — copy it here.
    if (newPage.slug.startsWith(NEWS_SLUG_PREFIX)) {
      const categoryService = new NewsCategoryService(new SupabaseNewsCategoryRepository(client), client, recordAuditLog)
      const categoryId = await categoryService.getArticleCategoryId(pageId)
      if (categoryId) {
        await categoryService.assignArticleCategory(actor, newPage.id, categoryId, newPage.websiteId, newRequestId())
      }
    }
    revalidatePath('/admin/cms')
    revalidatePath('/admin/news')
    return { ok: true, pageId: newPage.id }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
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

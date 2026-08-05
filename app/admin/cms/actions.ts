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
import { TOUR_SLUG_PREFIX } from '@/lib/cms/tour-constants'
import { TourCategoryService } from '@/modules/tour-categories/application/tour-category.service'
import { SupabaseTourCategoryRepository } from '@/modules/tour-categories/infrastructure/tour-category.repository'
import { TourDestinationService } from '@/modules/tour-destinations/application/tour-destination.service'
import { SupabaseTourDestinationRepository } from '@/modules/tour-destinations/infrastructure/tour-destination.repository'
import { SupabaseTourDepartureRepository } from '@/modules/tour-departures/infrastructure/tour-departure.repository'
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
 * News/Tour pages have no dedicated "what kind of page is this" flag —
 * the slug prefix convention (lib/cms/news-constants.ts, tour-constants.ts)
 * is the only signal for either. Both put their body text in the same
 * `content` section's RICH_TEXT block (see createNewsArticleAction,
 * createTourAction); neither can go live with it empty. One shared check
 * parameterized by prefix + message, rather than two near-identical
 * functions.
 */
async function requireContentBodyBeforePublish(
  actor: ActorContext,
  service: CmsService,
  pageId: string,
  slugPrefix: string,
  emptyMessage: string,
): Promise<string | null> {
  const page = await service.getPage(pageId)
  if (!page.slug.startsWith(slugPrefix)) return null
  const sections = await service.listSections(actor, pageId)
  const contentSection = sections.find((s) => s.sectionKey === 'content')
  const blocks = contentSection ? await service.listBlocks(actor, contentSection.id) : []
  const body = (blocks[0]?.config as { body?: string } | undefined)?.body ?? ''
  return body.trim() ? null : emptyMessage
}

export async function publishPageAction(pageId: string, scheduledPublishAt?: string): Promise<ActionResult> {
  const actor = await resolveActor()
  const service = await getService()
  const newsBodyError = await requireContentBodyBeforePublish(
    actor, service, pageId, NEWS_SLUG_PREFIX, 'Bài viết cần có nội dung (phần thân bài) trước khi xuất bản.',
  )
  if (newsBodyError) return { ok: false, message: newsBodyError }
  const tourBodyError = await requireContentBodyBeforePublish(
    actor, service, pageId, TOUR_SLUG_PREFIX, 'Tour cần có nội dung giới thiệu trước khi xuất bản.',
  )
  if (tourBodyError) return { ok: false, message: tourBodyError }
  const tourDepartureError = await requireTourDepartureBeforePublish(pageId)
  if (tourDepartureError) return { ok: false, message: tourDepartureError }
  return wrap(() => service.publishPage(actor, pageId, scheduledPublishAt ? { scheduledPublishAt } : {}, newRequestId()), pageId)
}

/** A Tour with no bookable dates isn't ready to go live — same "belongs to Sprint 7 Phase 0's Decision 1" reasoning as the content-body guard above, just checking a join table instead of a block. */
async function requireTourDepartureBeforePublish(pageId: string): Promise<string | null> {
  const client = await getServerSupabaseClient()
  const page = await new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog).getPage(pageId)
  if (!page.slug.startsWith(TOUR_SLUG_PREFIX)) return null
  const departures = await new SupabaseTourDepartureRepository(client).listByPage(pageId)
  return departures.length > 0 ? null : 'Tour cần có ít nhất 1 ngày khởi hành trước khi xuất bản.'
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
    // Same reasoning as News above — Tour categories (many-to-many) and
    // destinations live in their own join tables, not cms_blocks, so the
    // generic clone never sees them either.
    if (newPage.slug.startsWith(TOUR_SLUG_PREFIX)) {
      const tourCategoryService = new TourCategoryService(new SupabaseTourCategoryRepository(client), client, recordAuditLog)
      const tourDestinationService = new TourDestinationService(new SupabaseTourDestinationRepository(client), client, recordAuditLog)
      const [categoryIds, destinationIds] = await Promise.all([
        tourCategoryService.getTourCategoryIds(pageId),
        tourDestinationService.getTourDestinationIds(pageId),
      ])
      if (categoryIds.length > 0) {
        await tourCategoryService.assignTourCategories(actor, newPage.id, categoryIds, newPage.websiteId, newRequestId())
      }
      if (destinationIds.length > 0) {
        await tourDestinationService.assignTourDestinations(actor, newPage.id, destinationIds, newPage.websiteId, newRequestId())
      }
    }
    revalidatePath('/admin/cms')
    revalidatePath('/admin/news')
    revalidatePath('/admin/tours')
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

'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { NewsCategoryService } from '@/modules/news-categories/application/news-category.service'
import { SupabaseNewsCategoryRepository } from '@/modules/news-categories/infrastructure/news-category.repository'
import { newRequestId } from '@/shared/http/request-id'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'

export type CreateNewsResult = { ok: true; pageId: string } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

async function getCategoryService() {
  const client = await getServerSupabaseClient()
  return new NewsCategoryService(new SupabaseNewsCategoryRepository(client), client, recordAuditLog)
}

/**
 * Creates the page + first DRAFT version + the `meta` section/block
 * `lib/cms/news.ts` expects (category/excerpt/image/size/tags — empty
 * until edited via NewsMetaBlockForm on the shared Pages editor at
 * /admin/cms/{id}) + a `content` section/block (RICH_TEXT, empty body)
 * for the article's actual text — required non-empty before publish,
 * see `requireNewsBodyBeforePublish` in app/admin/cms/actions.ts.
 * `pageType: 'CUSTOM'` — the enum has no dedicated "single article"
 * value; ARTICLE_INDEX means the article-listing page, not one article.
 */
export async function createNewsArticleAction(input: {
  websiteId: string
  locale: 'vi' | 'en' | 'zh' | 'ko' | 'ja'
  title: string
  slugSuffix: string
  categoryId: string
}): Promise<CreateNewsResult> {
  try {
    const actor = await resolveActor()
    const service = await getService()
    const requestId = newRequestId()
    const { page } = await service.createPageWithDraftVersion(
      actor,
      { websiteId: input.websiteId, locale: input.locale, pageType: 'CUSTOM', slug: `${NEWS_SLUG_PREFIX}${input.slugSuffix}` },
      input.title,
      requestId,
    )
    const metaSection = await service.createSection(actor, page.id, 'meta', 0, requestId)
    await service.createBlock(
      actor,
      metaSection.id,
      'CUSTOM',
      0,
      { excerpt: '', image: null, size: 'small', featured: false, hot: false, pinned: false, tags: [] },
      requestId,
    )
    const contentSection = await service.createSection(actor, page.id, 'content', 1, requestId)
    await service.createBlock(actor, contentSection.id, 'RICH_TEXT', 0, { body: '' }, requestId)
    const categoryService = await getCategoryService()
    await categoryService.assignArticleCategory(actor, page.id, input.categoryId, input.websiteId, requestId)
    revalidatePath('/admin/news')
    revalidatePath('/tin-tuc')
    return { ok: true, pageId: page.id }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

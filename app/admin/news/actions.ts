'use server'

import { revalidatePath } from 'next/cache'
import { resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { newRequestId } from '@/shared/http/request-id'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'

export type CreateNewsResult = { ok: true; pageId: string } | { ok: false; message: string }

async function getService() {
  const client = await getServerSupabaseClient()
  return new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
}

/**
 * Creates the page + first DRAFT version + the one `meta` section/block
 * `lib/cms/news.ts` expects (category/excerpt/image/size — empty until
 * edited via NewsMetaBlockForm on the shared Pages editor at
 * /admin/cms/{id}). `pageType: 'CUSTOM'` — the enum has no dedicated
 * "single article" value; ARTICLE_INDEX means the article-listing page,
 * not one article.
 */
export async function createNewsArticleAction(input: {
  websiteId: string
  locale: 'vi' | 'en' | 'zh' | 'ko' | 'ja'
  title: string
  slugSuffix: string
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
    const section = await service.createSection(actor, page.id, 'meta', 0, requestId)
    await service.createBlock(actor, section.id, 'CUSTOM', 0, { category: '', excerpt: '', image: null, size: 'small' }, requestId)
    revalidatePath('/admin/news')
    return { ok: true, pageId: page.id }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Có lỗi xảy ra.' }
  }
}

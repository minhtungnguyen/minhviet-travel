import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/supabase/database.types'
import type { BrandStoryContent } from '@/types/homepage'
import type { CmsImage } from '@/types/cms'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'

/**
 * News articles are plain `cms_pages` (page_type CUSTOM) whose slug starts
 * with `tin-tuc/` — no new table for the article itself. Each article's
 * first section (`sectionKey = 'meta'`) carries `{ excerpt, image, size,
 * featured, hot, pinned }` in its block config; everything else (title,
 * publish date) already lives on `cms_page_versions`. Category is NOT part
 * of this JSON config — Sprint 5A moved it to a real relational table
 * (`news_categories`/`news_article_categories`, see
 * docs/backend/admin-os/10-sprint5a-news-categories-migration-preview.md)
 * per Founder decision. Used by `/tin-tuc`, `/tin-tuc/[slug]`, and the
 * homepage's `brandCenter.stories`, so all three always show the same set
 * of real, published articles.
 */

/** One row per page_id, resolved through news_article_categories -> news_categories. Empty string when an article has no category row yet. */
async function resolveCategoryNames(client: SupabaseClient<Database>, pageIds: string[]): Promise<Map<string, string>> {
  if (pageIds.length === 0) return new Map()
  const { data: assignments } = await client.from('news_article_categories').select('page_id, category_id').in('page_id', pageIds)
  const categoryIdByPage = new Map((assignments ?? []).map((a) => [a.page_id, a.category_id]))
  const categoryIds = [...new Set(categoryIdByPage.values())]
  if (categoryIds.length === 0) return new Map()
  const { data: categories } = await client.from('news_categories').select('id, name').in('id', categoryIds)
  const nameById = new Map((categories ?? []).map((c) => [c.id, c.name]))
  const result = new Map<string, string>()
  for (const [pageId, categoryId] of categoryIdByPage) {
    result.set(pageId, nameById.get(categoryId) ?? '')
  }
  return result
}

export type NewsListItem = {
  id: string
  slug: string
  title: string
  category: string
  excerpt: string
  image: CmsImage | null
  publishedAt: string | null
  featured: boolean
  hot: boolean
  pinned: boolean
}

/** Paginated list for the public `/tin-tuc` index — newest first, pinned articles surfaced first within that order. */
export async function listPublishedNews(
  client: SupabaseClient<Database>,
  websiteId: string,
  locale: string,
  pagination: { page: number; pageSize: number },
): Promise<{ items: NewsListItem[]; total: number }> {
  const { data: pages, error: pagesError } = await client
    .from('cms_pages')
    .select('id, slug')
    .eq('website_id', websiteId)
    .eq('locale', locale)
    .like('slug', `${NEWS_SLUG_PREFIX}%`)
    .is('deleted_at', null)
  if (pagesError || !pages || pages.length === 0) return { items: [], total: 0 }

  const pageIds = pages.map((p) => p.id)
  const { data: versions, error: versionsError } = await client
    .from('cms_page_versions')
    .select('id, page_id, title, published_at')
    .in('page_id', pageIds)
    .eq('is_current', true)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
  if (versionsError || !versions || versions.length === 0) return { items: [], total: 0 }

  const versionIds = versions.map((v) => v.id)
  const { data: sections } = await client
    .from('cms_sections')
    .select('id, page_version_id')
    .in('page_version_id', versionIds)
    .eq('section_key', 'meta')
  const sectionByVersion = new Map((sections ?? []).map((s) => [s.page_version_id, s.id]))

  const sectionIds = [...sectionByVersion.values()]
  const { data: blocks } = sectionIds.length
    ? await client.from('cms_blocks').select('section_id, config').in('section_id', sectionIds)
    : { data: [] as { section_id: string; config: unknown }[] }
  const configBySection = new Map((blocks ?? []).map((b) => [b.section_id, b.config as Record<string, unknown>]))

  const pageById = new Map(pages.map((p) => [p.id, p]))
  const categoryNameByPage = await resolveCategoryNames(client, pageIds)

  const allItems = versions
    .map((version): NewsListItem | null => {
      const page = pageById.get(version.page_id)
      const sectionId = sectionByVersion.get(version.id)
      const meta = sectionId ? configBySection.get(sectionId) : undefined
      if (!page || !meta) return null
      return {
        id: page.id,
        slug: page.slug.slice(NEWS_SLUG_PREFIX.length),
        title: version.title,
        category: categoryNameByPage.get(page.id) ?? '',
        excerpt: String(meta.excerpt ?? ''),
        image: (meta.image as CmsImage | null) ?? null,
        publishedAt: version.published_at,
        featured: Boolean(meta.featured),
        hot: Boolean(meta.hot),
        pinned: Boolean(meta.pinned),
      }
    })
    .filter((s): s is NewsListItem => s !== null)
    // Pinned articles float to the top; within each group, already newest-first from the query order above.
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))

  const total = allItems.length
  const from = (pagination.page - 1) * pagination.pageSize
  const items = allItems.slice(from, from + pagination.pageSize)
  return { items, total }
}
/** Other published articles sharing `categoryId`, excluding `excludePageId` — for the "Related Posts" section on an article detail page. Empty when the article has no category yet. */
export async function listRelatedNews(
  client: SupabaseClient<Database>,
  websiteId: string,
  locale: string,
  categoryId: string | null,
  excludePageId: string,
  limit: number,
): Promise<NewsListItem[]> {
  if (!categoryId) return []

  const { data: assignments } = await client
    .from('news_article_categories')
    .select('page_id')
    .eq('category_id', categoryId)
    .neq('page_id', excludePageId)
  const candidatePageIds = (assignments ?? []).map((a) => a.page_id)
  if (candidatePageIds.length === 0) return []

  const { data: pages, error: pagesError } = await client
    .from('cms_pages')
    .select('id, slug')
    .eq('website_id', websiteId)
    .eq('locale', locale)
    .in('id', candidatePageIds)
    .is('deleted_at', null)
  if (pagesError || !pages || pages.length === 0) return []

  const pageIds = pages.map((p) => p.id)
  const { data: versions, error: versionsError } = await client
    .from('cms_page_versions')
    .select('id, page_id, title, published_at')
    .in('page_id', pageIds)
    .eq('is_current', true)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (versionsError || !versions || versions.length === 0) return []

  const versionIds = versions.map((v) => v.id)
  const { data: sections } = await client
    .from('cms_sections')
    .select('id, page_version_id')
    .in('page_version_id', versionIds)
    .eq('section_key', 'meta')
  const sectionByVersion = new Map((sections ?? []).map((s) => [s.page_version_id, s.id]))

  const sectionIds = [...sectionByVersion.values()]
  const { data: blocks } = sectionIds.length
    ? await client.from('cms_blocks').select('section_id, config').in('section_id', sectionIds)
    : { data: [] as { section_id: string; config: unknown }[] }
  const configBySection = new Map((blocks ?? []).map((b) => [b.section_id, b.config as Record<string, unknown>]))

  const pageById = new Map(pages.map((p) => [p.id, p]))

  return versions
    .map((version): NewsListItem | null => {
      const page = pageById.get(version.page_id)
      const sectionId = sectionByVersion.get(version.id)
      const meta = sectionId ? configBySection.get(sectionId) : undefined
      if (!page || !meta) return null
      return {
        id: page.id,
        slug: page.slug.slice(NEWS_SLUG_PREFIX.length),
        title: version.title,
        category: '',
        excerpt: String(meta.excerpt ?? ''),
        image: (meta.image as CmsImage | null) ?? null,
        publishedAt: version.published_at,
        featured: Boolean(meta.featured),
        hot: Boolean(meta.hot),
        pinned: Boolean(meta.pinned),
      }
    })
    .filter((s): s is NewsListItem => s !== null)
}

export async function listRecentPublishedNews(
  client: SupabaseClient<Database>,
  websiteId: string,
  locale: string,
  limit: number,
): Promise<BrandStoryContent[]> {
  const { data: pages, error: pagesError } = await client
    .from('cms_pages')
    .select('id, slug')
    .eq('website_id', websiteId)
    .eq('locale', locale)
    .like('slug', `${NEWS_SLUG_PREFIX}%`)
    .is('deleted_at', null)
  if (pagesError || !pages || pages.length === 0) return []

  const pageIds = pages.map((p) => p.id)
  const { data: versions, error: versionsError } = await client
    .from('cms_page_versions')
    .select('id, page_id, title, published_at')
    .in('page_id', pageIds)
    .eq('is_current', true)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (versionsError || !versions || versions.length === 0) return []

  const versionIds = versions.map((v) => v.id)
  const { data: sections } = await client
    .from('cms_sections')
    .select('id, page_version_id')
    .in('page_version_id', versionIds)
    .eq('section_key', 'meta')
  const sectionByVersion = new Map((sections ?? []).map((s) => [s.page_version_id, s.id]))

  const sectionIds = [...sectionByVersion.values()]
  const { data: blocks } = sectionIds.length
    ? await client.from('cms_blocks').select('section_id, config').in('section_id', sectionIds)
    : { data: [] as { section_id: string; config: unknown }[] }
  const configBySection = new Map((blocks ?? []).map((b) => [b.section_id, b.config as Record<string, unknown>]))

  const pageById = new Map(pages.map((p) => [p.id, p]))
  const categoryNameByPage = await resolveCategoryNames(client, pageIds)

  return versions
    .map((version): BrandStoryContent | null => {
      const page = pageById.get(version.page_id)
      const sectionId = sectionByVersion.get(version.id)
      const meta = sectionId ? configBySection.get(sectionId) : undefined
      if (!page || !meta) return null
      const slug = page.slug.slice(NEWS_SLUG_PREFIX.length)
      return {
        id: page.id,
        category: categoryNameByPage.get(page.id) ?? '',
        title: version.title,
        description: String(meta.excerpt ?? ''),
        date: version.published_at ? new Date(version.published_at).toLocaleDateString('vi-VN') : '',
        image: meta.image as BrandStoryContent['image'],
        href: `/${NEWS_SLUG_PREFIX}${slug}`,
        size: (meta.size as BrandStoryContent['size']) ?? 'small',
      }
    })
    .filter((s): s is BrandStoryContent => s !== null)
}

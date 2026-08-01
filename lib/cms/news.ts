import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/supabase/database.types'
import type { BrandStoryContent } from '@/types/homepage'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'

/**
 * News articles are plain `cms_pages` (page_type STATIC_PAGE) whose slug
 * starts with `brand/news/` — no new table. Each article's first section
 * (`sectionKey = 'meta'`) carries `{ category, excerpt, image, size }` in
 * its block config; everything else (title, publish date) already lives
 * on `cms_page_versions`. Used both by `/brand/news` and by the
 * homepage's `brandCenter.stories`, so both always show the same set of
 * real, published articles.
 */
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

  return versions
    .map((version): BrandStoryContent | null => {
      const page = pageById.get(version.page_id)
      const sectionId = sectionByVersion.get(version.id)
      const meta = sectionId ? configBySection.get(sectionId) : undefined
      if (!page || !meta) return null
      const slug = page.slug.slice(NEWS_SLUG_PREFIX.length)
      return {
        id: page.id,
        category: String(meta.category ?? ''),
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

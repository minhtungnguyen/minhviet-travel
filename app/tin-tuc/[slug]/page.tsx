import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { CmsGenericPageRenderer } from '@/components/site/cms-generic-page-renderer'
import { NewsArticleJsonLd } from '@/components/seo/json-ld'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'
import { SITE_URL } from '@/constants/seo'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'

async function loadArticle(slug: string) {
  const client = getPublicSupabaseClient()
  const cms = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const content = await cms.getPublicPage(WEBSITE_ID, LOCALE, `${NEWS_SLUG_PREFIX}${slug}`).catch(() => null)
  if (!content) return null
  const definitions = await cms.listBlockDefinitions()
  const metaSection = content.sections.find((s) => s.sectionKey === 'meta')
  const meta = (metaSection?.blocks[0]?.config ?? {}) as Record<string, unknown>
  const bodySections = content.sections.filter((s) => s.sectionKey !== 'meta')

  const { data: assignment } = await client
    .from('news_article_categories')
    .select('category_id')
    .eq('page_id', content.page.id)
    .maybeSingle()
  let categoryName = ''
  if (assignment?.category_id) {
    const { data: categoryRow } = await client.from('news_categories').select('name').eq('id', assignment.category_id).maybeSingle()
    categoryName = categoryRow?.name ?? ''
  }

  return { ...content, client, meta, bodySections, categoryName, keyById: new Map(definitions.map((d) => [d.id, d.key])) }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadArticle(slug)
  if (!loaded) return {}
  const { version, client, meta } = loaded
  const canonicalPath = `/tin-tuc/${slug}`
  const featuredImageSrc = (meta.image as { src?: string } | null)?.src
  if (!version.seoMetadataId) {
    return {
      title: version.title,
      alternates: { canonical: canonicalPath },
      openGraph: featuredImageSrc ? { images: [{ url: featuredImageSrc }] } : undefined,
    }
  }
  const { data: seoRow } = await client
    .from('seo_metadata')
    .select('title, meta_description, og_title, og_description')
    .eq('id', version.seoMetadataId)
    .maybeSingle()
  const row = seoRow as { title?: string; meta_description?: string; og_title?: string; og_description?: string } | null
  const title = row?.title ?? version.title
  const description = row?.meta_description ?? String(meta.excerpt ?? '') ?? undefined
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: row?.og_title ?? title,
      description: row?.og_description ?? description,
      url: `${SITE_URL}${canonicalPath}`,
      type: 'article',
      images: featuredImageSrc ? [{ url: featuredImageSrc }] : undefined,
    },
  }
}

export default async function TinTucArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadArticle(slug)
  if (!loaded) notFound()

  const { version, meta, bodySections, categoryName, keyById } = loaded
  const excerpt = String(meta.excerpt ?? '')
  const featuredImageSrc = (meta.image as { src?: string } | null)?.src ?? null

  return (
    <SiteChrome>
      <NewsArticleJsonLd
        title={version.title}
        description={excerpt || undefined}
        path={`/tin-tuc/${slug}`}
        imageSrc={featuredImageSrc}
        publishedAt={version.publishedAt}
        category={categoryName || undefined}
      />
      <PageHero eyebrow={categoryName || 'Tin tức'} title={version.title} description={excerpt || undefined} breadcrumb={version.title} />
      <CmsGenericPageRenderer sections={bodySections} blockDefinitionKeyById={keyById} />
    </SiteChrome>
  )
}

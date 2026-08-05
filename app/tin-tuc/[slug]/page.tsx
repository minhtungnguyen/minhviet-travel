import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
import { resolveDefaultSeoMetadata } from '@/lib/seo/default-metadata'
import { resolveMediaImageUrl } from '@/lib/seo/resolve-media-image'
import { listRelatedNews } from '@/lib/cms/news'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'
const RELATED_LIMIT = 3

/**
 * Author byline is best-effort: `cms_page_versions.created_by` resolves
 * through the `public_author_display_name` RPC, which does not exist
 * yet — `user_profiles` (where the real name lives) has no anon-read
 * policy, and a blanket one would leak `account_status`/`last_login_at`
 * via PostgREST regardless of what this file selects. A narrow
 * SECURITY DEFINER function is the proposed fix (see Sprint 6 Phase 0
 * migration preview); until that lands and is approved, this call
 * fails safely and the byline is simply omitted — same honest-degrade
 * pattern as every other public content read in this codebase.
 */
async function loadAuthorName(client: ReturnType<typeof getPublicSupabaseClient>, userId: string | null): Promise<string | null> {
  if (!userId) return null
  // `as never`: the RPC function doesn't exist in the generated DB types
  // yet (pending migration approval, see comment above) — this call
  // resolves to { data: null, error } until it's created, never throws.
  const { data, error } = await client.rpc('public_author_display_name' as never, { p_user_id: userId } as never)
  if (error || typeof data !== 'string' || !data) return null
  return data
}

async function loadArticle(slug: string) {
  const client = getPublicSupabaseClient()
  const cms = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const content = await cms.getPublicPage(WEBSITE_ID, LOCALE, `${NEWS_SLUG_PREFIX}${slug}`).catch(() => null)
  if (!content) return null
  const definitions = await cms.listBlockDefinitions()
  const metaSection = content.sections.find((s) => s.sectionKey === 'meta')
  const meta = (metaSection?.blocks[0]?.config ?? {}) as Record<string, unknown>
  const tags = Array.isArray(meta.tags) ? (meta.tags as string[]) : []
  const bodySections = content.sections.filter((s) => s.sectionKey !== 'meta')

  const { data: assignment } = await client
    .from('news_article_categories')
    .select('category_id')
    .eq('page_id', content.page.id)
    .maybeSingle()
  const categoryId = assignment?.category_id ?? null
  let categoryName = ''
  if (categoryId) {
    const { data: categoryRow } = await client.from('news_categories').select('name').eq('id', categoryId).maybeSingle()
    categoryName = categoryRow?.name ?? ''
  }

  const [authorName, relatedPosts] = await Promise.all([
    loadAuthorName(client, content.version.createdBy),
    listRelatedNews(client, WEBSITE_ID, LOCALE, categoryId, content.page.id, RELATED_LIMIT),
  ])

  return {
    ...content,
    client,
    meta,
    tags,
    bodySections,
    categoryName,
    authorName,
    relatedPosts,
    keyById: new Map(definitions.map((d) => [d.id, d.key])),
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadArticle(slug)
  if (!loaded) return {}
  const { version, client, meta } = loaded
  const fallback = await resolveDefaultSeoMetadata(client, version.title)
  const canonicalPath = `/tin-tuc/${slug}`
  const canonicalUrl = `${fallback.canonicalBaseUrl}${canonicalPath}`
  const featuredImageSrc = (meta.image as { src?: string } | null)?.src

  if (!version.seoMetadataId) {
    const description = String(meta.excerpt ?? '') || fallback.description
    const image = featuredImageSrc ?? fallback.ogImage
    return {
      title: fallback.title,
      description,
      robots: fallback.robots,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: fallback.title,
        description,
        url: canonicalUrl,
        siteName: fallback.siteName,
        type: 'article',
        images: image ? [{ url: image }] : undefined,
      },
      twitter: { card: fallback.twitterCard as 'summary_large_image' },
    }
  }
  const { data: seoRow } = await client
    .from('seo_metadata')
    .select('title, meta_description, canonical_url, og_title, og_description, is_indexed, is_followed, og_image_media_id, featured_image_media_id')
    .eq('id', version.seoMetadataId)
    .maybeSingle()
  const row = seoRow as {
    title?: string
    meta_description?: string
    canonical_url?: string | null
    og_title?: string
    og_description?: string
    is_indexed?: boolean
    is_followed?: boolean
    og_image_media_id?: string | null
    featured_image_media_id?: string | null
  } | null
  const title = row?.title ?? version.title
  const description = row?.meta_description ?? String(meta.excerpt ?? '') ?? undefined
  const robots = row ? `${row.is_indexed === false ? 'noindex' : 'index'}, ${row.is_followed === false ? 'nofollow' : 'follow'}` : fallback.robots
  // Editors can pin a custom canonical (syndication/dedup); falls back to this article's own URL.
  const resolvedCanonicalUrl = row?.canonical_url || canonicalUrl
  // Fallback chain: per-page OG image -> article's featured image -> global default.
  const ogImage =
    (await resolveMediaImageUrl(client, row?.og_image_media_id)) ??
    featuredImageSrc ??
    (await resolveMediaImageUrl(client, row?.featured_image_media_id)) ??
    fallback.ogImage
  return {
    title,
    description,
    robots,
    alternates: { canonical: resolvedCanonicalUrl },
    openGraph: {
      title: row?.og_title ?? title,
      description: row?.og_description ?? description,
      url: resolvedCanonicalUrl,
      siteName: fallback.siteName,
      type: 'article',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: fallback.twitterCard as 'summary_large_image' },
  }
}

export default async function TinTucArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadArticle(slug)
  if (!loaded) notFound()

  const { version, client, meta, tags, bodySections, categoryName, authorName, relatedPosts, keyById } = loaded
  const excerpt = String(meta.excerpt ?? '')
  const featuredImageSrc = (meta.image as { src?: string } | null)?.src ?? null
  const fallback = await resolveDefaultSeoMetadata(client, version.title)
  const publishedLabel = version.publishedAt ? new Date(version.publishedAt).toLocaleDateString('vi-VN') : null

  return (
    <SiteChrome>
      <NewsArticleJsonLd
        title={version.title}
        description={excerpt || undefined}
        path={`/tin-tuc/${slug}`}
        imageSrc={featuredImageSrc}
        publishedAt={version.publishedAt}
        category={categoryName || undefined}
        authorName={authorName}
        baseUrl={fallback.canonicalBaseUrl}
        organizationName={fallback.organizationName}
        organizationLogo={fallback.organizationLogo}
      />
      <PageHero
        eyebrow={categoryName || 'Tin tức'}
        title={version.title}
        description={excerpt || undefined}
        image={featuredImageSrc ?? undefined}
        breadcrumb={version.title}
      />

      {(authorName || publishedLabel || tags.length > 0) && (
        <div className="container-mv -mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pt-10 text-sm text-muted-foreground">
          {authorName && <span>Tác giả: <span className="font-medium text-foreground">{authorName}</span></span>}
          {publishedLabel && <span>{publishedLabel}</span>}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <CmsGenericPageRenderer sections={bodySections} blockDefinitionKeyById={keyById} />

      {relatedPosts.length > 0 && (
        <div className="container-mv pb-16">
          <h2 className="mb-6 font-display text-xl font-bold text-foreground">Bài viết liên quan</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedPosts.map((item) => (
              <Link
                key={item.id}
                href={`/tin-tuc/${item.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary/30">
                  {item.image?.src && (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt || item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary">{item.title}</h3>
                  {item.excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </SiteChrome>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { CmsGenericPageRenderer } from '@/components/site/cms-generic-page-renderer'
import { GenericPageJsonLd } from '@/components/seo/json-ld'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { resolveDefaultSeoMetadata } from '@/lib/seo/default-metadata'
import { resolveMediaImageUrl } from '@/lib/seo/resolve-media-image'

/**
 * Generic public renderer for any PUBLISHED, non-homepage `cms_pages` row
 * (About, policy pages, ...) — Phase 4 (CMS Operations V1). The homepage
 * keeps its own dedicated route (app/page.tsx, bespoke section
 * components) — this is not a Homepage Builder, it renders a different,
 * generic block set (see cms-generic-page-renderer.tsx). News articles
 * live at /tin-tuc/[slug] (their own route), not here.
 */

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'

async function loadPage(slug: string) {
  if (slug === 'home') return null // reserved for `/` (app/page.tsx) — never double-served here
  const client = getPublicSupabaseClient()
  const cms = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const content = await cms.getPublicPage(WEBSITE_ID, LOCALE, slug).catch(() => null)
  if (!content) return null
  const definitions = await cms.listBlockDefinitions()
  return { ...content, client, keyById: new Map(definitions.map((d) => [d.id, d.key])) }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadPage(slug)
  if (!loaded) return {}
  const { version, client } = loaded
  const fallback = await resolveDefaultSeoMetadata(client, version.title)
  const canonicalPath = `/${slug}`
  const canonicalUrl = `${fallback.canonicalBaseUrl}${canonicalPath}`

  if (!version.seoMetadataId) {
    return {
      title: fallback.title,
      description: fallback.description,
      robots: fallback.robots,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: fallback.title,
        description: fallback.description,
        url: canonicalUrl,
        siteName: fallback.siteName,
        type: 'website',
        images: fallback.ogImage ? [{ url: fallback.ogImage }] : undefined,
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
  const description = row?.meta_description ?? undefined
  const robots = row ? `${row.is_indexed === false ? 'noindex' : 'index'}, ${row.is_followed === false ? 'nofollow' : 'follow'}` : fallback.robots
  // Editors can pin a custom canonical (syndication/dedup); falls back to this page's own URL.
  const resolvedCanonicalUrl = row?.canonical_url || canonicalUrl
  // Fallback chain: per-page OG image -> featured image -> global default.
  const ogImage =
    (await resolveMediaImageUrl(client, row?.og_image_media_id)) ??
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
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: fallback.twitterCard as 'summary_large_image' },
  }
}

export default async function GenericCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadPage(slug)
  if (!loaded) notFound()

  const { version, sections, keyById, client } = loaded
  const path = `/${slug}`
  const fallback = await resolveDefaultSeoMetadata(client, version.title)

  return (
    <SiteChrome>
      <GenericPageJsonLd
        title={version.title}
        path={path}
        baseUrl={fallback.canonicalBaseUrl}
        breadcrumb={[
          { name: 'Trang chủ', path: '/' },
          { name: version.title, path },
        ]}
      />
      <PageHero eyebrow="Minh Việt Travel" title={version.title} breadcrumb={version.title} />
      <CmsGenericPageRenderer sections={sections} blockDefinitionKeyById={keyById} />
    </SiteChrome>
  )
}

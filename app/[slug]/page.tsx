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
import { SITE_URL } from '@/constants/seo'
import { resolveDefaultSeoMetadata } from '@/lib/seo/default-metadata'

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
  const canonicalPath = `/${slug}`
  if (!version.seoMetadataId) {
    const fallback = await resolveDefaultSeoMetadata(client, version.title)
    return {
      title: fallback.title,
      description: fallback.description,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: fallback.title,
        description: fallback.description,
        url: `${SITE_URL}${canonicalPath}`,
        type: 'website',
        images: fallback.ogImage ? [{ url: fallback.ogImage }] : undefined,
      },
    }
  }
  const { data: seoRow } = await client
    .from('seo_metadata')
    .select('title, meta_description, og_title, og_description')
    .eq('id', version.seoMetadataId)
    .maybeSingle()
  const row = seoRow as { title?: string; meta_description?: string; og_title?: string; og_description?: string } | null
  const title = row?.title ?? version.title
  const description = row?.meta_description ?? undefined
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: row?.og_title ?? title,
      description: row?.og_description ?? description,
      url: `${SITE_URL}${canonicalPath}`,
      type: 'website',
    },
  }
}

export default async function GenericCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadPage(slug)
  if (!loaded) notFound()

  const { version, sections, keyById } = loaded
  const path = `/${slug}`

  return (
    <SiteChrome>
      <GenericPageJsonLd
        title={version.title}
        path={path}
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

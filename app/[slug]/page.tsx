import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { CmsGenericPageRenderer } from '@/components/site/cms-generic-page-renderer'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'

/**
 * Generic public renderer for any PUBLISHED, non-homepage `cms_pages` row
 * (About, policy pages, News articles, ...) — Phase 4 (CMS Operations V1).
 * The homepage keeps its own dedicated route (app/page.tsx, bespoke
 * section components) — this is not a Homepage Builder, it renders a
 * different, generic block set (see cms-generic-page-renderer.tsx).
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
  if (!version.seoMetadataId) return { title: version.title }
  const { data: seoRow } = await client
    .from('seo_metadata')
    .select('title, meta_description')
    .eq('id', version.seoMetadataId)
    .maybeSingle()
  return {
    title: (seoRow as { title?: string } | null)?.title ?? version.title,
    description: (seoRow as { meta_description?: string } | null)?.meta_description ?? undefined,
  }
}

export default async function GenericCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadPage(slug)
  if (!loaded) notFound()

  const { version, sections, keyById } = loaded

  return (
    <SiteChrome>
      <PageHero eyebrow="Minh Việt Travel" title={version.title} breadcrumb={version.title} />
      <CmsGenericPageRenderer sections={sections} blockDefinitionKeyById={keyById} />
    </SiteChrome>
  )
}

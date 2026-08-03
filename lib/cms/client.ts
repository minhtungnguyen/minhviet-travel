import 'server-only'
import { cache } from 'react'
import { homepageContentSeed } from '@/lib/cms/content/homepage.seed'
import { homepageContentSchema } from '@/lib/cms/schema'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { CmsService } from '@/modules/cms/application/cms.service'
import { SupabaseCmsRepository } from '@/modules/cms/infrastructure/cms.repository'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'
import { listRecentPublishedNews } from '@/lib/cms/news'
import { logger } from '@/shared/logging/logger'
import type { HomepageContent } from '@/types/homepage'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'
const HOME_SLUG = 'home'

/**
 * Sprint 2 ("Make the CMS usable"): reads the real HOME cms_page instead
 * of the static seed. Every homepage section component still only reads
 * `HomepageContent` — this is the one seam that changed, exactly per the
 * comment this file used to carry.
 *
 * `featuredJourneys`/`destinations` are NOT sourced from the CMS yet —
 * those depend on a real Tour/Destination product module that doesn't
 * exist (out of scope for this sprint's 10 named modules), so they keep
 * reading from the static seed. Everything else (hero, trustStrip,
 * coreServices, enterpriseMice, aiAdvisor, ceoSection, brandCenter,
 * finalCta, seo) is real and admin-editable.
 *
 * Any failure (page not published, content fails validation) falls back
 * to the static seed rather than crashing the homepage — an honest
 * degrade a visitor never sees as an error, logged server-side so it
 * gets fixed.
 */
export const getHomepageContent = cache(async (): Promise<HomepageContent> => {
  try {
    return await loadFromCms()
  } catch (error) {
    logger.error('homepage-content', 'Falling back to static seed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return homepageContentSchema.parse(homepageContentSeed)
  }
})

async function loadFromCms(): Promise<HomepageContent> {
  const client = getPublicSupabaseClient()
  const cms = new CmsService(new SupabaseCmsRepository(client), client, recordAuditLog)
  const settings = new SettingsService(new SupabaseSettingsRepository(client), recordAuditLog)

  const { version, sections } = await cms.getPublicPage(WEBSITE_ID, LOCALE, HOME_SLUG)

  const configFor = (sectionKey: string): unknown => {
    const section = sections.find((s) => s.sectionKey === sectionKey)
    const config = section?.blocks[0]?.config
    if (!config) throw new Error(`Missing CMS content for homepage section "${sectionKey}"`)
    return config
  }

  const [seoMetadata, news] = await Promise.all([
    version.seoMetadataId
      ? client.from('seo_metadata').select('*').eq('id', version.seoMetadataId).maybeSingle()
      : Promise.resolve({ data: null }),
    listRecentPublishedNews(client, WEBSITE_ID, LOCALE, 3),
  ])

  const [hotline, email, city] = await Promise.all([
    settings.getSetting('company.hotline', { organizationId: undefined }),
    settings.getSetting('company.email', { organizationId: undefined }),
    settings.getSetting('company.city', { organizationId: undefined }),
  ])

  const brandCenterConfig = configFor('brandCenter')
  const seoRow = seoMetadata.data as {
    title?: string
    meta_description?: string
    canonical_url?: string
  } | null

  const raw: HomepageContent = {
    hero: configFor('hero') as HomepageContent['hero'],
    trustStrip: configFor('trustStrip') as HomepageContent['trustStrip'],
    coreServices: configFor('coreServices') as HomepageContent['coreServices'],
    enterpriseMice: configFor('enterpriseMice') as HomepageContent['enterpriseMice'],
    aiAdvisor: configFor('aiAdvisor') as HomepageContent['aiAdvisor'],
    ceoSection: configFor('ceoSection') as HomepageContent['ceoSection'],
    featuredJourneys: homepageContentSeed.featuredJourneys,
    destinations: homepageContentSeed.destinations,
    brandCenter: {
      ...(brandCenterConfig as unknown as Omit<HomepageContent['brandCenter'], 'stories'>),
      stories: news.length > 0 ? news : homepageContentSeed.brandCenter.stories,
    },
    finalCta: configFor('finalCta') as HomepageContent['finalCta'],
    seo: {
      title: seoRow?.title || homepageContentSeed.seo.title,
      description: seoRow?.meta_description || homepageContentSeed.seo.description,
      canonicalPath: seoRow?.canonical_url ? new URL(seoRow.canonical_url).pathname : homepageContentSeed.seo.canonicalPath,
      organizationName: homepageContentSeed.seo.organizationName,
      organizationLogo: homepageContentSeed.seo.organizationLogo,
      contactPhone: String(hotline.resolved.value || homepageContentSeed.seo.contactPhone),
      contactEmail: String(email.resolved.value || homepageContentSeed.seo.contactEmail),
      addressLocality: String(city.resolved.value || homepageContentSeed.seo.addressLocality),
      addressCountry: homepageContentSeed.seo.addressCountry,
    },
  }

  return homepageContentSchema.parse(raw)
}

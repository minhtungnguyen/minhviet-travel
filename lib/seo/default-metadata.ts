import 'server-only'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'
import { SITE_URL, ORGANIZATION_NAME, ORGANIZATION_LOGO } from '@/constants/seo'

export type DefaultSeoMetadata = {
  title: string
  description?: string
  ogImage?: string
  robots?: string
  twitterCard: string
  canonicalBaseUrl: string
  siteName?: string
  organizationName: string
  organizationLogo: string
}

/**
 * Website-level SEO fallback + global SEO settings (Sprint 5B, Founder
 * decision — "Expand Global SEO settings", reusing the existing 'seo'
 * settings namespace, no new table). `title`/`description`/`ogImage` are
 * used when a page has no `seo_metadata` row of its own; the rest
 * (twitterCard/canonicalBaseUrl/organization*) apply site-wide regardless
 * of whether a page has its own seo_metadata, since those aren't
 * per-page concepts. Falls back to just the page's own title + the
 * constants/seo.ts values on any error — a settings-read hiccup must
 * never break a page's metadata.
 */
export async function resolveDefaultSeoMetadata(client: SupabaseClientLike, pageTitle: string): Promise<DefaultSeoMetadata> {
  const fallback: DefaultSeoMetadata = {
    title: pageTitle,
    twitterCard: 'summary_large_image',
    canonicalBaseUrl: SITE_URL,
    organizationName: ORGANIZATION_NAME,
    organizationLogo: ORGANIZATION_LOGO,
  }
  try {
    const settings = new SettingsService(new SupabaseSettingsRepository(client), () => Promise.resolve())
    const [template, description, ogImage, robots, twitterCard, canonicalBaseUrl, siteName, orgName, orgLogo] = await Promise.all([
      settings.getSetting('seo.default_title_template', {}),
      settings.getSetting('seo.default_description', {}),
      settings.getSetting('seo.default_og_image', {}),
      settings.getSetting('seo.default_robots', {}),
      settings.getSetting('seo.twitter_card_type', {}),
      settings.getSetting('seo.canonical_base_url', {}),
      settings.getSetting('seo.site_name', {}),
      settings.getSetting('seo.organization_name', {}),
      settings.getSetting('seo.organization_logo', {}),
    ])
    const templateValue = String(template.resolved.value || '')
    const title = templateValue ? templateValue.replace('{title}', pageTitle) : pageTitle
    return {
      title,
      description: String(description.resolved.value || '') || undefined,
      ogImage: String(ogImage.resolved.value || '') || undefined,
      robots: String(robots.resolved.value || '') || undefined,
      twitterCard: String(twitterCard.resolved.value || '') || fallback.twitterCard,
      canonicalBaseUrl: String(canonicalBaseUrl.resolved.value || '') || fallback.canonicalBaseUrl,
      siteName: String(siteName.resolved.value || '') || undefined,
      organizationName: String(orgName.resolved.value || '') || fallback.organizationName,
      organizationLogo: String(orgLogo.resolved.value || '') || fallback.organizationLogo,
    }
  } catch {
    return fallback
  }
}

export type SiteWideSeoSettings = {
  googleSiteVerification?: string
  bingSiteVerification?: string
  facebookAppId?: string
}

/** Site-wide-only settings (not per-page) — used by app/layout.tsx to inject verification/app-id meta tags. */
export async function resolveSiteWideSeoSettings(client: SupabaseClientLike): Promise<SiteWideSeoSettings> {
  try {
    const settings = new SettingsService(new SupabaseSettingsRepository(client), () => Promise.resolve())
    const [google, bing, fbAppId] = await Promise.all([
      settings.getSetting('seo.google_site_verification', {}),
      settings.getSetting('seo.bing_site_verification', {}),
      settings.getSetting('seo.facebook_app_id', {}),
    ])
    return {
      googleSiteVerification: String(google.resolved.value || '') || undefined,
      bingSiteVerification: String(bing.resolved.value || '') || undefined,
      facebookAppId: String(fbAppId.resolved.value || '') || undefined,
    }
  } catch {
    return {}
  }
}

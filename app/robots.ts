import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/constants/seo'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { resolveDefaultSeoMetadata } from '@/lib/seo/default-metadata'

/**
 * Reads the real `seo.default_robots` setting (Sprint 6) instead of a
 * hardcoded allow-all. The setting stores a per-page-style directive
 * (e.g. "index, follow" / "noindex, nofollow" — same format as the
 * per-page `robots` meta tag, see lib/seo/default-metadata.ts) rather
 * than raw robots.txt syntax, so "noindex" in it maps to disallowing
 * the whole site here. Defaults to allow-all (current behavior) if the
 * setting is empty or unreadable — a settings hiccup must never
 * silently deindex the site.
 *
 * `revalidate`: this route has no per-request dynamic API usage (same
 * situation as app/page.tsx), so without this it would be computed
 * once at build time and never re-read the setting afterwards — the
 * Settings admin UI saves via a plain PUT fetch with no revalidatePath
 * hook of its own. 5 minutes matches the homepage's own ISR window.
 */
export const revalidate = 300
export default async function robots(): Promise<MetadataRoute.Robots> {
  const client = getPublicSupabaseClient()
  const { robots: directive } = await resolveDefaultSeoMetadata(client, '')
  const blocked = Boolean(directive?.toLowerCase().includes('noindex'))
  return {
    rules: {
      userAgent: '*',
      ...(blocked ? { disallow: '/' } : { allow: '/' }),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

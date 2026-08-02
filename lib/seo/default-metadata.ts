import 'server-only'
import type { SupabaseClientLike } from '@/shared/supabase/types'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'

export type DefaultSeoMetadata = { title: string; description?: string; ogImage?: string }

/**
 * Website-level SEO fallback (Sprint 5B, Founder decision) — used when a
 * page has no `seo_metadata` row of its own (`seo.default_title_template`,
 * `seo.default_description`, `seo.default_og_image`, reusing the existing
 * 'seo' settings namespace, no new table). Falls back to just the page's
 * own title on any error — a settings-read hiccup must never break a
 * page's metadata.
 */
export async function resolveDefaultSeoMetadata(client: SupabaseClientLike, pageTitle: string): Promise<DefaultSeoMetadata> {
  try {
    const settings = new SettingsService(new SupabaseSettingsRepository(client), () => Promise.resolve())
    const [template, description, ogImage] = await Promise.all([
      settings.getSetting('seo.default_title_template', {}),
      settings.getSetting('seo.default_description', {}),
      settings.getSetting('seo.default_og_image', {}),
    ])
    const templateValue = String(template.resolved.value || '')
    const title = templateValue ? templateValue.replace('{title}', pageTitle) : pageTitle
    return {
      title,
      description: String(description.resolved.value || '') || undefined,
      ogImage: String(ogImage.resolved.value || '') || undefined,
    }
  } catch {
    return { title: pageTitle }
  }
}

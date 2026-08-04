import 'server-only'
import type { SupabaseClientLike } from '@/shared/supabase/types'

/**
 * Resolves a `media_assets.id` (as stored in `seo_metadata.og_image_media_id`
 * / `featured_image_media_id`) to a public URL. Used to complete the
 * per-page -> featured -> global-default OG image fallback chain — see
 * `resolveDefaultSeoMetadata` for the global-default tier.
 */
export async function resolveMediaImageUrl(client: SupabaseClientLike, mediaId: string | null | undefined): Promise<string | null> {
  if (!mediaId) return null
  const { data } = await client.from('media_assets').select('storage_path').eq('id', mediaId).maybeSingle()
  if (!data?.storage_path) return null
  const { data: urlData } = client.storage.from('media-public').getPublicUrl(data.storage_path)
  return urlData?.publicUrl ?? null
}

import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { RedirectRule, SeoMetadata } from '@/modules/seo/domain/types'
import type { RedirectRuleCreateInput, RedirectRuleUpdateInput, SeoMetadataPutInput } from '@/modules/seo/schemas/seo.schema'

export interface SeoRepository {
  findMetadata(websiteId: string, entityType: string, entityId: string, locale: string): Promise<SeoMetadata | null>
  upsertMetadata(entityType: string, entityId: string, input: SeoMetadataPutInput): Promise<SeoMetadata>
  findMetadataByCanonicalUrl(websiteId: string, canonicalUrl: string): Promise<SeoMetadata | null>

  recordSlugHistory(entry: {
    websiteId: string
    entityType: string
    entityId: string
    oldLocale: string
    oldSlug: string
    changedBy: string | null
  }): Promise<void>

  listRedirects(websiteId: string): Promise<RedirectRule[]>
  findRedirectById(id: string): Promise<RedirectRule | null>
  findRedirectBySourcePath(websiteId: string, sourcePath: string): Promise<RedirectRule | null>
  createRedirect(input: RedirectRuleCreateInput): Promise<RedirectRule>
  updateRedirect(id: string, input: RedirectRuleUpdateInput): Promise<RedirectRule>
  deleteRedirect(id: string): Promise<void>
}

type MetadataRow = {
  id: string
  website_id: string
  locale: string
  entity_type: string
  entity_id: string
  title: string
  meta_description: string | null
  slug: string
  canonical_url: string | null
  is_indexed: boolean
  is_followed: boolean
  og_title: string | null
  og_description: string | null
  og_image_media_id: string | null
  twitter_card_type: string | null
  featured_image_media_id: string | null
  structured_data: unknown
  breadcrumb_config: unknown
  hreflang_group_id: string | null
}
const mapMetadata = (r: MetadataRow): SeoMetadata => ({
  id: r.id,
  websiteId: r.website_id,
  locale: r.locale,
  entityType: r.entity_type,
  entityId: r.entity_id,
  title: r.title,
  metaDescription: r.meta_description,
  slug: r.slug,
  canonicalUrl: r.canonical_url,
  isIndexed: r.is_indexed,
  isFollowed: r.is_followed,
  ogTitle: r.og_title,
  ogDescription: r.og_description,
  ogImageMediaId: r.og_image_media_id,
  twitterCardType: r.twitter_card_type,
  featuredImageMediaId: r.featured_image_media_id,
  structuredData: (r.structured_data ?? {}) as Record<string, unknown>,
  breadcrumbConfig: (r.breadcrumb_config ?? []) as unknown[],
  hreflangGroupId: r.hreflang_group_id,
})

type RedirectRow = {
  id: string
  website_id: string
  locale: string | null
  source_path: string
  destination_url: string
  redirect_kind: string
  status: string
  hit_count: number
}
const mapRedirect = (r: RedirectRow): RedirectRule => ({
  id: r.id,
  websiteId: r.website_id,
  locale: r.locale,
  sourcePath: r.source_path,
  destinationUrl: r.destination_url,
  redirectKind: r.redirect_kind as RedirectRule['redirectKind'],
  status: r.status as RedirectRule['status'],
  hitCount: r.hit_count,
})

export class SupabaseSeoRepository implements SeoRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async findMetadata(websiteId: string, entityType: string, entityId: string, locale: string): Promise<SeoMetadata | null> {
    const { data, error } = await this.client
      .from('seo_metadata')
      .select('*')
      .eq('website_id', websiteId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('locale', locale)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'SeoMetadata')
    return data ? mapMetadata(data) : null
  }

  async upsertMetadata(entityType: string, entityId: string, input: SeoMetadataPutInput): Promise<SeoMetadata> {
    const { data, error } = await this.client
      .from('seo_metadata')
      .upsert(
        {
          website_id: input.websiteId,
          locale: input.locale,
          entity_type: entityType,
          entity_id: entityId,
          title: input.title,
          meta_description: input.metaDescription ?? null,
          slug: input.slug,
          canonical_url: input.canonicalUrl ?? null,
          is_indexed: input.isIndexed,
          is_followed: input.isFollowed,
          og_title: input.ogTitle ?? null,
          og_description: input.ogDescription ?? null,
          og_image_media_id: input.ogImageMediaId ?? null,
          twitter_card_type: input.twitterCardType ?? null,
          featured_image_media_id: input.featuredImageMediaId ?? null,
          structured_data: input.structuredData as never,
          breadcrumb_config: input.breadcrumbConfig as never,
          hreflang_group_id: input.hreflangGroupId ?? null,
        },
        { onConflict: 'website_id,entity_type,entity_id,locale' },
      )
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'SeoMetadata')
    return mapMetadata(data)
  }

  async findMetadataByCanonicalUrl(websiteId: string, canonicalUrl: string): Promise<SeoMetadata | null> {
    const { data, error } = await this.client
      .from('seo_metadata')
      .select('*')
      .eq('website_id', websiteId)
      .ilike('canonical_url', canonicalUrl)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'SeoMetadata')
    return data ? mapMetadata(data) : null
  }

  async recordSlugHistory(entry: {
    websiteId: string
    entityType: string
    entityId: string
    oldLocale: string
    oldSlug: string
    changedBy: string | null
  }): Promise<void> {
    const { error } = await this.client.from('slug_history').insert({
      website_id: entry.websiteId,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      old_locale: entry.oldLocale,
      old_slug: entry.oldSlug,
      changed_by: entry.changedBy,
    })
    if (error) throw mapDatabaseError(error, 'SlugHistory')
  }

  async listRedirects(websiteId: string): Promise<RedirectRule[]> {
    const { data, error } = await this.client.from('redirect_rules').select('*').eq('website_id', websiteId)
    if (error) throw mapDatabaseError(error, 'RedirectRule')
    return (data ?? []).map(mapRedirect)
  }

  async findRedirectById(id: string): Promise<RedirectRule | null> {
    const { data, error } = await this.client.from('redirect_rules').select('*').eq('id', id).maybeSingle()
    if (error) throw mapDatabaseError(error, 'RedirectRule')
    return data ? mapRedirect(data) : null
  }

  async findRedirectBySourcePath(websiteId: string, sourcePath: string): Promise<RedirectRule | null> {
    const { data, error } = await this.client
      .from('redirect_rules')
      .select('*')
      .eq('website_id', websiteId)
      .eq('source_path', sourcePath)
      .maybeSingle()
    if (error) throw mapDatabaseError(error, 'RedirectRule')
    return data ? mapRedirect(data) : null
  }

  async createRedirect(input: RedirectRuleCreateInput): Promise<RedirectRule> {
    const { data, error } = await this.client
      .from('redirect_rules')
      .insert({
        website_id: input.websiteId,
        locale: input.locale ?? null,
        source_path: input.sourcePath,
        destination_url: input.destinationUrl,
        redirect_kind: input.redirectKind,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'RedirectRule')
    return mapRedirect(data)
  }

  async updateRedirect(id: string, input: RedirectRuleUpdateInput): Promise<RedirectRule> {
    const { data, error } = await this.client
      .from('redirect_rules')
      .update({
        ...(input.locale !== undefined && { locale: input.locale }),
        ...(input.sourcePath !== undefined && { source_path: input.sourcePath }),
        ...(input.destinationUrl !== undefined && { destination_url: input.destinationUrl }),
        ...(input.redirectKind !== undefined && { redirect_kind: input.redirectKind }),
        ...(input.status !== undefined && { status: input.status }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'RedirectRule')
    return mapRedirect(data)
  }

  async deleteRedirect(id: string): Promise<void> {
    const { error } = await this.client.from('redirect_rules').delete().eq('id', id)
    if (error) throw mapDatabaseError(error, 'RedirectRule')
  }
}

import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type { MediaAsset, MediaAssetUsage, MediaFolder } from '@/modules/media/domain/types'
import type { MediaAssetCreateInput, MediaAssetUpdateInput, MediaFolderCreateInput } from '@/modules/media/schemas/media.schema'

export interface MediaRepository {
  listFolders(websiteId?: string): Promise<MediaFolder[]>
  createFolder(input: MediaFolderCreateInput, actorId: string): Promise<MediaFolder>

  listAssets(websiteId: string | undefined, query: PaginationQuery, folderId?: string | null): Promise<PaginatedResult<MediaAsset>>
  findAssetById(id: string): Promise<MediaAsset | null>
  createAsset(input: MediaAssetCreateInput, actorId: string): Promise<MediaAsset>
  updateAsset(id: string, input: MediaAssetUpdateInput): Promise<MediaAsset>
  softDeleteAsset(id: string): Promise<void>
  findAssetUsage(assetId: string, storagePath: string): Promise<MediaAssetUsage[]>
}

type FolderRow = { id: string; website_id: string | null; parent_folder_id: string | null; name: string }
const mapFolder = (r: FolderRow): MediaFolder => ({ id: r.id, websiteId: r.website_id, parentFolderId: r.parent_folder_id, name: r.name })

type AssetRow = {
  id: string
  folder_id: string | null
  website_id: string | null
  original_filename: string
  storage_path: string
  visibility: string
  mime_type: string
  file_size_bytes: number
  width: number | null
  height: number | null
  duration_seconds: number | null
  alt_text: string | null
  caption: string | null
  credit: string | null
  copyright_info: string | null
  source: string | null
  license_status: string | null
  checksum: string | null
  deleted_at: string | null
}
const mapAsset = (r: AssetRow): MediaAsset => ({
  id: r.id,
  folderId: r.folder_id,
  websiteId: r.website_id,
  originalFilename: r.original_filename,
  storagePath: r.storage_path,
  visibility: r.visibility as MediaAsset['visibility'],
  mimeType: r.mime_type,
  fileSizeBytes: r.file_size_bytes,
  width: r.width,
  height: r.height,
  durationSeconds: r.duration_seconds,
  altText: r.alt_text,
  caption: r.caption,
  credit: r.credit,
  copyrightInfo: r.copyright_info,
  source: r.source,
  licenseStatus: r.license_status,
  checksum: r.checksum,
  deletedAt: r.deleted_at,
})

export class SupabaseMediaRepository implements MediaRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async listFolders(websiteId?: string): Promise<MediaFolder[]> {
    let builder = this.client.from('media_folders').select('*')
    builder = websiteId ? builder.eq('website_id', websiteId) : builder.is('website_id', null)
    const { data, error } = await builder.order('name')
    if (error) throw mapDatabaseError(error, 'MediaFolder')
    return (data ?? []).map(mapFolder)
  }

  async createFolder(input: MediaFolderCreateInput, actorId: string): Promise<MediaFolder> {
    const { data, error } = await this.client
      .from('media_folders')
      .insert({
        website_id: input.websiteId ?? null,
        parent_folder_id: input.parentFolderId ?? null,
        name: input.name,
        created_by: actorId,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'MediaFolder')
    return mapFolder(data)
  }

  async listAssets(websiteId: string | undefined, query: PaginationQuery, folderId?: string | null): Promise<PaginatedResult<MediaAsset>> {
    const from = (query.page - 1) * query.pageSize
    let builder = this.client.from('media_assets').select('*', { count: 'exact' }).is('deleted_at', null)
    builder = websiteId ? builder.eq('website_id', websiteId) : builder.is('website_id', null)
    if (folderId !== undefined) builder = folderId === null ? builder.is('folder_id', null) : builder.eq('folder_id', folderId)
    if (query.search) builder = builder.ilike('original_filename', `%${query.search}%`)
    builder = builder.order(query.sort ?? 'created_at', { ascending: query.order === 'asc' })
    const { data, error, count } = await builder.range(from, from + query.pageSize - 1)
    if (error) throw mapDatabaseError(error, 'MediaAsset')
    return { items: (data ?? []).map(mapAsset), page: query.page, pageSize: query.pageSize, total: count ?? 0 }
  }

  async findAssetById(id: string): Promise<MediaAsset | null> {
    const { data, error } = await this.client.from('media_assets').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
    if (error) throw mapDatabaseError(error, 'MediaAsset')
    return data ? mapAsset(data) : null
  }

  async createAsset(input: MediaAssetCreateInput, actorId: string): Promise<MediaAsset> {
    const { data, error } = await this.client
      .from('media_assets')
      .insert({
        folder_id: input.folderId ?? null,
        website_id: input.websiteId ?? null,
        original_filename: input.originalFilename,
        storage_path: input.storagePath,
        visibility: input.visibility,
        mime_type: input.mimeType,
        file_size_bytes: input.fileSizeBytes,
        width: input.width ?? null,
        height: input.height ?? null,
        duration_seconds: input.durationSeconds ?? null,
        alt_text: input.altText ?? null,
        caption: input.caption ?? null,
        credit: input.credit ?? null,
        copyright_info: input.copyrightInfo ?? null,
        source: input.source ?? null,
        license_status: input.licenseStatus ?? null,
        checksum: input.checksum ?? null,
        uploaded_by: actorId,
      })
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'MediaAsset')
    return mapAsset(data)
  }

  async updateAsset(id: string, input: MediaAssetUpdateInput): Promise<MediaAsset> {
    const { data, error } = await this.client
      .from('media_assets')
      .update({
        ...(input.folderId !== undefined && { folder_id: input.folderId }),
        ...(input.visibility !== undefined && { visibility: input.visibility }),
        ...(input.altText !== undefined && { alt_text: input.altText }),
        ...(input.caption !== undefined && { caption: input.caption }),
        ...(input.credit !== undefined && { credit: input.credit }),
        ...(input.copyrightInfo !== undefined && { copyright_info: input.copyrightInfo }),
        ...(input.source !== undefined && { source: input.source }),
        ...(input.licenseStatus !== undefined && { license_status: input.licenseStatus }),
        ...(input.originalFilename !== undefined && { original_filename: input.originalFilename }),
        ...(input.mimeType !== undefined && { mime_type: input.mimeType }),
        ...(input.fileSizeBytes !== undefined && { file_size_bytes: input.fileSizeBytes }),
        ...(input.width !== undefined && { width: input.width }),
        ...(input.height !== undefined && { height: input.height }),
        ...(input.checksum !== undefined && { checksum: input.checksum }),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw mapDatabaseError(error, 'MediaAsset')
    return mapAsset(data)
  }

  async softDeleteAsset(id: string): Promise<void> {
    const { error } = await this.client.from('media_assets').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw mapDatabaseError(error, 'MediaAsset')
  }

  /**
   * Sprint 5B "Media Usage panel". `seo_metadata.og_image_media_id` /
   * `featured_image_media_id` are real FK-shaped columns — exact match.
   * `cms_blocks.config` is opaque JSONB with no fixed shape (image src is
   * a full public URL string embedded at a different key per block type
   * — hero/image/news-meta all differ), so there is no clean relational
   * query for "does this block reference this asset". Best effort:
   * fetch every block and substring-match its serialized config against
   * the asset's storage_path. Fine at this table's current size; would
   * need revisiting (a real media_id column on blocks, or a search index)
   * if the CMS block count grows large — not built here since no such
   * scale exists yet.
   */
  async findAssetUsage(assetId: string, storagePath: string): Promise<MediaAssetUsage[]> {
    const usage: MediaAssetUsage[] = []

    const { data: seoRows } = await this.client
      .from('seo_metadata')
      .select('title, slug, og_image_media_id, featured_image_media_id')
      .or(`og_image_media_id.eq.${assetId},featured_image_media_id.eq.${assetId}`)
    for (const row of seoRows ?? []) {
      const label = row.title || row.slug || 'không tên'
      if (row.og_image_media_id === assetId) usage.push({ type: 'seo_og_image', label: `SEO — ảnh OG của "${label}"` })
      if (row.featured_image_media_id === assetId) usage.push({ type: 'seo_featured_image', label: `SEO — ảnh đại diện của "${label}"` })
    }

    const { data: blocks } = await this.client.from('cms_blocks').select('id, section_id, config')
    const matchingBlocks = (blocks ?? []).filter((b) => JSON.stringify(b.config ?? {}).includes(storagePath))
    if (matchingBlocks.length > 0) {
      const sectionIds = matchingBlocks.map((b) => b.section_id)
      const { data: sections } = await this.client.from('cms_sections').select('id, page_version_id, section_key').in('id', sectionIds)
      const versionIds = [...new Set((sections ?? []).map((s) => s.page_version_id))]
      const { data: versions } = versionIds.length
        ? await this.client.from('cms_page_versions').select('id, page_id').in('id', versionIds)
        : { data: [] as { id: string; page_id: string }[] }
      const pageIds = [...new Set((versions ?? []).map((v) => v.page_id))]
      const { data: pages } = pageIds.length
        ? await this.client.from('cms_pages').select('id, slug').in('id', pageIds)
        : { data: [] as { id: string; slug: string }[] }

      const pageById = new Map((pages ?? []).map((p) => [p.id, p]))
      const versionById = new Map((versions ?? []).map((v) => [v.id, v]))
      const sectionById = new Map((sections ?? []).map((s) => [s.id, s]))

      for (const block of matchingBlocks) {
        const section = sectionById.get(block.section_id)
        const version = section ? versionById.get(section.page_version_id) : undefined
        const page = version ? pageById.get(version.page_id) : undefined
        usage.push({
          type: 'cms_block',
          label: `Trang /${page?.slug ?? '?'} — section "${section?.section_key ?? '?'}"`,
          href: page ? `/admin/cms/${page.id}` : undefined,
        })
      }
    }

    return usage
  }
}

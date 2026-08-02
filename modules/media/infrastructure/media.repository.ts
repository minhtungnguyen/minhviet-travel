import type { SupabaseClientLike } from '@/shared/supabase/types'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'
import type { PaginatedResult, PaginationQuery } from '@/shared/validation/pagination'
import type { MediaAsset, MediaFolder } from '@/modules/media/domain/types'
import type { MediaAssetCreateInput, MediaAssetUpdateInput, MediaFolderCreateInput } from '@/modules/media/schemas/media.schema'

export interface MediaRepository {
  listFolders(websiteId?: string): Promise<MediaFolder[]>
  createFolder(input: MediaFolderCreateInput, actorId: string): Promise<MediaFolder>

  listAssets(websiteId: string | undefined, query: PaginationQuery, folderId?: string | null): Promise<PaginatedResult<MediaAsset>>
  findAssetById(id: string): Promise<MediaAsset | null>
  createAsset(input: MediaAssetCreateInput, actorId: string): Promise<MediaAsset>
  updateAsset(id: string, input: MediaAssetUpdateInput): Promise<MediaAsset>
  softDeleteAsset(id: string): Promise<void>
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
}

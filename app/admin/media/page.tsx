import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { hasPermission, resolveActor } from '@/shared/auth/session'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { MediaService } from '@/modules/media/application/media.service'
import { SupabaseMediaRepository } from '@/modules/media/infrastructure/media.repository'
import { SettingsService } from '@/modules/settings/application/settings.service'
import { SupabaseSettingsRepository } from '@/modules/settings/infrastructure/settings.repository'
import { AdminUnauthorized } from '@/components/admin/admin-unauthorized'
import { MediaUploadForm } from '@/components/admin/media-upload-form'
import { MediaFolderNav } from '@/components/admin/media-folder-nav'
import { MediaAssetCard } from '@/components/admin/media-asset-card'
import { paginationQuerySchema } from '@/shared/validation/pagination'
import type { MediaAsset } from '@/modules/media/domain/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/supabase/database.types'

export const metadata: Metadata = { title: 'Media | Minh Việt Travel Admin' }

async function resolveAssetUrl(supabase: SupabaseClient<Database>, asset: MediaAsset): Promise<string | null> {
  if (asset.visibility === 'PUBLIC') {
    const { data } = supabase.storage.from('media-public').getPublicUrl(asset.storagePath)
    return data.publicUrl
  }
  const { data } = await supabase.storage.from('media-private').createSignedUrl(asset.storagePath, 3600)
  return data?.signedUrl ?? null
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; folderId?: string; search?: string }>
}) {
  const params = await searchParams
  const actor = await resolveActor()
  if (!hasPermission(actor, 'media.asset.read')) {
    return <AdminUnauthorized />
  }

  const supabase = await getServerSupabaseClient()
  const mediaService = new MediaService(new SupabaseMediaRepository(supabase), supabase, recordAuditLog)
  const settingsService = new SettingsService(new SupabaseSettingsRepository(supabase), recordAuditLog)

  const query = paginationQuerySchema.parse({ page: params.page, search: params.search, pageSize: 24 })
  const [result, folders, maxUploadSetting] = await Promise.all([
    mediaService.listAssets(actor, undefined, query, params.folderId ?? null),
    mediaService.listFolders(actor, undefined),
    settingsService.getSetting('storage.max_upload_size_mb', { organizationId: actor.organizationId ?? undefined }),
  ])
  const urls = await Promise.all(result.items.map((asset) => resolveAssetUrl(supabase, asset)))
  const canUpload = hasPermission(actor, 'media.asset.upload')
  const maxUploadSizeMb = typeof maxUploadSetting.resolved.value === 'number' ? maxUploadSetting.resolved.value : 20

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Media Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">{result.total} tệp.</p>
      </div>

      <MediaFolderNav folders={folders.filter((f) => !f.parentFolderId)} currentFolderId={params.folderId} canWrite={canUpload} />

      <form className="flex max-w-sm items-center gap-2">
        {params.folderId && <input type="hidden" name="folderId" value={params.folderId} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Tìm theo tên tệp..."
            className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm"
          />
        </div>
        <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/60">
          Tìm
        </button>
      </form>

      {canUpload && <MediaUploadForm folderId={params.folderId} maxUploadSizeMb={maxUploadSizeMb} />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {result.items.map((asset, i) => (
          <MediaAssetCard key={asset.id} asset={asset} url={urls[i]} canEdit={canUpload} />
        ))}
        {result.items.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">Chưa có tệp nào.</p>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageOff, X } from 'lucide-react'
import { getBrowserSupabaseClient } from '@/shared/supabase/browser-client'

type PickableAsset = { id: string; storagePath: string; originalFilename: string; altText: string | null; visibility: string; mimeType: string }

export type OgImageValue = { mediaId: string; src: string } | null

/**
 * Same Media Library picker pattern as `MediaPickerInput`, but returns
 * `{ mediaId, src }` instead of a `CmsImage` — `seo_metadata.og_image_media_id`
 * is a media_assets FK, not a denormalized image object. Kept as its own
 * component rather than changing `MediaPickerInput`'s return shape, which
 * every other block-config picker already depends on.
 */
export function SeoOgImagePicker({ value, onChange }: { value: OgImageValue; onChange: (value: OgImageValue) => void }) {
  const [open, setOpen] = useState(false)
  const [assets, setAssets] = useState<PickableAsset[]>([])
  const [loading, setLoading] = useState(false)

  async function ensureLoaded() {
    if (assets.length > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/v1/media/assets?pageSize=50')
      const body = await res.json()
      const items: PickableAsset[] = body?.data?.items ?? []
      setAssets(items.filter((a) => a.visibility === 'PUBLIC' && a.mimeType.startsWith('image/')))
    } finally {
      setLoading(false)
    }
  }

  function pick(asset: PickableAsset) {
    const supabase = getBrowserSupabaseClient()
    const { data } = supabase.storage.from('media-public').getPublicUrl(asset.storagePath)
    onChange({ mediaId: asset.id, src: data.publicUrl })
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-border p-2">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary/40">
            <Image src={value.src} alt="" fill sizes="56px" className="object-cover" unoptimized />
          </div>
          <p className="flex-1 truncate text-xs text-muted-foreground">Ảnh OG đã chọn</p>
          <button type="button" onClick={() => onChange(null)} aria-label="Bỏ ảnh" className="p-1 text-muted-foreground hover:text-destructive">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            void ensureLoaded()
          }}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary/40"
        >
          <ImageOff className="size-4" />
          Chọn ảnh OG từ Media Library
        </button>
      )}

      {open && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">Chọn ảnh công khai</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="text-muted-foreground">
              <X className="size-4" />
            </button>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground">Đang tải...</p>
          ) : assets.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có ảnh công khai nào trong Media Library.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => pick(asset)}
                  className="relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary"
                  title={asset.originalFilename}
                >
                  <Image
                    src={getBrowserSupabaseClient().storage.from('media-public').getPublicUrl(asset.storagePath).data.publicUrl}
                    alt={asset.altText ?? asset.originalFilename}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

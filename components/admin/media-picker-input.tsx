'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ImageOff, X } from 'lucide-react'
import { getBrowserSupabaseClient } from '@/shared/supabase/browser-client'
import type { CmsImage } from '@/types/cms'

type PickableAsset = { id: string; storagePath: string; originalFilename: string; altText: string | null; visibility: string; mimeType: string }

/**
 * Minimal image picker over the Media Library — public-visibility image
 * assets only (a partner logo/portrait rendered on the public homepage
 * must resolve without a session). Used by the real per-block-type CMS
 * editor forms (Hero, trustStrip partners, CEO section) instead of
 * making staff hand-type a storage path.
 */
export function MediaPickerInput({
  value,
  onChange,
  altPlaceholder,
}: {
  value: CmsImage | null
  onChange: (image: CmsImage | null) => void
  altPlaceholder: string
}) {
  const [open, setOpen] = useState(false)
  const [assets, setAssets] = useState<PickableAsset[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || assets.length > 0) return
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/media/assets?pageSize=50')
        const body = await res.json()
        if (cancelled) return
        const items: PickableAsset[] = body?.data?.items ?? []
        setAssets(items.filter((a) => a.visibility === 'PUBLIC' && a.mimeType.startsWith('image/')))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [open, assets.length])

  function pick(asset: PickableAsset) {
    const supabase = getBrowserSupabaseClient()
    const { data } = supabase.storage.from('media-public').getPublicUrl(asset.storagePath)
    onChange({ src: data.publicUrl, alt: asset.altText || altPlaceholder, width: 800, height: 600 })
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-border p-2">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary/40">
            <Image src={value.src} alt={value.alt} fill sizes="56px" className="object-cover" unoptimized />
          </div>
          <p className="flex-1 truncate text-xs text-muted-foreground">{value.alt}</p>
          <button type="button" onClick={() => onChange(null)} aria-label="Bỏ ảnh" className="p-1 text-muted-foreground hover:text-destructive">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary/40"
        >
          <ImageOff className="size-4" />
          Chọn ảnh từ Media Library
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

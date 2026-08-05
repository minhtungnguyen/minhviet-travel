'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, ImageOff, Plus, X } from 'lucide-react'
import { getBrowserSupabaseClient } from '@/shared/supabase/browser-client'

export type GalleryImage = { mediaAssetId: string; src: string; alt: string }
type PickableAsset = { id: string; storagePath: string; originalFilename: string; altText: string | null; visibility: string; mimeType: string }

/**
 * Multi-select image picker over the Media Library — generalizes
 * MediaPickerInput's single-image fetch/filter/render logic to a
 * reorderable array instead of replacing one value. Public-visibility
 * image assets only, same reasoning as MediaPickerInput (must resolve
 * without a session on the public site). The first image is the cover
 * image wherever a gallery needs exactly one (card thumbnail, hero).
 *
 * Storing `src` (not just `mediaAssetId`) in the saved config is
 * deliberate: media.repository.ts's findAssetUsage() greps
 * cms_blocks.config for the asset's storage path as a plain substring
 * — since `src` is the public URL, it already contains that path, so
 * gallery images show up in "asset usage" with zero extra plumbing.
 */
export function GalleryPickerInput({ value, onChange }: { value: GalleryImage[]; onChange: (images: GalleryImage[]) => void }) {
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

  function add(asset: PickableAsset) {
    if (value.some((v) => v.mediaAssetId === asset.id)) return
    const supabase = getBrowserSupabaseClient()
    const { data } = supabase.storage.from('media-public').getPublicUrl(asset.storagePath)
    onChange([...value, { mediaAssetId: asset.id, src: data.publicUrl, alt: asset.altText || asset.originalFilename }])
  }
  function remove(mediaAssetId: string) {
    onChange(value.filter((v) => v.mediaAssetId !== mediaAssetId))
  }
  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((img, i) => (
            <div key={img.mediaAssetId} className="group relative aspect-square overflow-hidden rounded-md border border-border">
              <Image src={img.src} alt={img.alt} fill sizes="120px" className="object-cover" unoptimized />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Ảnh bìa</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-white disabled:opacity-30" aria-label="Lên">
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                  className="p-1 text-white disabled:opacity-30"
                  aria-label="Xuống"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button type="button" onClick={() => remove(img.mediaAssetId)} className="p-1 text-white" aria-label="Xoá ảnh">
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary/40"
      >
        <Plus className="size-4" />
        Thêm ảnh từ Media Library
      </button>

      {open && (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">Chọn ảnh công khai (bấm để thêm)</p>
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
              {assets.map((asset) => {
                const picked = value.some((v) => v.mediaAssetId === asset.id)
                return (
                  <button
                    key={asset.id}
                    type="button"
                    disabled={picked}
                    onClick={() => add(asset)}
                    className="relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary disabled:opacity-40"
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
                    {picked && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-semibold text-white">
                        Đã chọn
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
          {assets.length === 0 && !loading && (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ImageOff className="size-3" /> Tải ảnh lên ở trang Media trước.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'
import { GalleryPickerInput, type GalleryImage } from '@/components/admin/gallery-picker-input'

export type TourGalleryConfig = { images: GalleryImage[] }

/** Photo gallery editor for the `gallery` section — reuses the already-seeded GALLERY block-definition key (previously unimplemented) and the real Media Library, not a static JSON array. First image doubles as the cover/hero image. */
export function TourGalleryBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: TourGalleryConfig }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<GalleryImage[]>(initial.images)

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateBlockConfigAction(pageId, blockId, { images } as unknown as Record<string, unknown>)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {images.length === 0 && (
        <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">Chưa có ảnh nào trong thư viện ảnh của tour.</p>
      )}
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <GalleryPickerInput value={images} onChange={setImages} />
      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FileIcon, Pencil, Loader2, RefreshCw } from 'lucide-react'
import { getBrowserSupabaseClient } from '@/shared/supabase/browser-client'
import { updateAssetAction } from '@/app/admin/media/actions'
import type { MediaAsset } from '@/modules/media/domain/types'

function bucketFor(visibility: 'PUBLIC' | 'PRIVATE') {
  return visibility === 'PUBLIC' ? 'media-public' : 'media-private'
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(objectUrl)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl
  })
}

export function MediaAssetCard({ asset, url, canEdit }: { asset: MediaAsset; url: string | null; canEdit: boolean }) {
  const router = useRouter()
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [altText, setAltText] = useState(asset.altText ?? '')
  const [caption, setCaption] = useState(asset.caption ?? '')
  const [credit, setCredit] = useState(asset.credit ?? '')
  const [copyrightInfo, setCopyrightInfo] = useState(asset.copyrightInfo ?? '')
  const [source, setSource] = useState(asset.source ?? '')
  const [licenseStatus, setLicenseStatus] = useState(asset.licenseStatus ?? '')

  const isImage = asset.mimeType.startsWith('image/')
  const sizeLabel = asset.fileSizeBytes >= 1024 * 1024
    ? `${(asset.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(asset.fileSizeBytes / 1024)} KB`

  async function handleSave() {
    setSaving(true)
    setError(null)
    const result = await updateAssetAction(asset.id, {
      altText: altText || null,
      caption: caption || null,
      credit: credit || null,
      copyrightInfo: copyrightInfo || null,
      source: source || null,
      licenseStatus: licenseStatus || null,
    })
    setSaving(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setEditing(false)
    router.refresh()
  }

  /**
   * Sprint 5B "Replace file" (Founder decision: overwrite in place, no
   * version history). Uploads the new binary to the SAME storage_path
   * (`upsert: true` — the default `upload()` call errors if the object
   * already exists) so the asset's id/URL/alt/caption/etc. never change,
   * only the technical metadata that genuinely did (mime type, size,
   * dimensions).
   */
  async function handleReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!window.confirm(`Thay tệp "${asset.originalFilename}" bằng tệp mới? Tệp cũ sẽ bị ghi đè, không thể khôi phục.`)) {
      if (replaceInputRef.current) replaceInputRef.current.value = ''
      return
    }
    setReplacing(true)
    setError(null)
    try {
      const supabase = getBrowserSupabaseClient()
      const { error: uploadError } = await supabase.storage.from(bucketFor(asset.visibility)).upload(asset.storagePath, file, { upsert: true })
      if (uploadError) {
        setError(`Tải lên thất bại: ${uploadError.message}`)
        return
      }
      const dimensions = await readImageDimensions(file)
      const result = await updateAssetAction(asset.id, {
        originalFilename: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    } finally {
      setReplacing(false)
      if (replaceInputRef.current) replaceInputRef.current.value = ''
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative flex aspect-square items-center justify-center bg-secondary/30">
        {isImage && url ? (
          <Image src={url} alt={asset.altText ?? asset.originalFilename} fill sizes="200px" className="object-cover" unoptimized />
        ) : (
          <FileIcon className="size-8 text-muted-foreground" />
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-medium text-foreground" title={asset.originalFilename}>
          {asset.originalFilename}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {asset.visibility === 'PUBLIC' ? 'Công khai' : 'Riêng tư'} · {sizeLabel}
          {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
        </p>
        {canEdit && (
          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <Pencil className="size-3" />
              {editing ? 'Đóng' : 'Sửa metadata'}
            </button>
            <button
              type="button"
              disabled={replacing}
              onClick={() => replaceInputRef.current?.click()}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
            >
              {replacing ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Thay tệp
            </button>
            <input ref={replaceInputRef} type="file" onChange={handleReplaceFile} disabled={replacing} className="hidden" />
          </div>
        )}
      </div>

      {editing && (
        <div className="space-y-2 border-t border-border p-3">
          {error && <p className="text-xs text-destructive">{error}</p>}
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Alt text"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
          <input
            type="text"
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            placeholder="Credit (nguồn ảnh)"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
          <input
            type="text"
            value={copyrightInfo}
            onChange={(e) => setCopyrightInfo(e.target.value)}
            placeholder="Copyright"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Nguồn (source)"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
          <input
            type="text"
            value={licenseStatus}
            onChange={(e) => setLicenseStatus(e.target.value)}
            placeholder="Tình trạng bản quyền (license status)"
            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-primary text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            Lưu
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FileIcon, Pencil, Loader2 } from 'lucide-react'
import { updateAssetAction } from '@/app/admin/media/actions'
import type { MediaAsset } from '@/modules/media/domain/types'

export function MediaAssetCard({ asset, url, canEdit }: { asset: MediaAsset; url: string | null; canEdit: boolean }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
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
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            <Pencil className="size-3" />
            {editing ? 'Đóng' : 'Sửa metadata'}
          </button>
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

'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FileIcon, Pencil, Loader2, RefreshCw, Link2, Copy, Check, Trash2 } from 'lucide-react'
import { getBrowserSupabaseClient } from '@/shared/supabase/browser-client'
import { computeFileChecksum } from '@/lib/media/checksum'
import { updateAssetAction, getAssetUsageAction, deleteAssetAction } from '@/app/admin/media/actions'
import type { MediaAsset, MediaAssetUsage } from '@/modules/media/domain/types'

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
  const [showUsage, setShowUsage] = useState(false)
  const [loadingUsage, setLoadingUsage] = useState(false)
  const [usage, setUsage] = useState<MediaAssetUsage[] | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

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
      const [dimensions, checksum] = await Promise.all([readImageDimensions(file), computeFileChecksum(file)])
      const result = await updateAssetAction(asset.id, {
        originalFilename: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        checksum,
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

  async function handleToggleUsage() {
    if (showUsage) {
      setShowUsage(false)
      return
    }
    setShowUsage(true)
    if (usage !== null) return // already fetched once — no need to refetch on every toggle
    setLoadingUsage(true)
    const result = await getAssetUsageAction(asset.id)
    setLoadingUsage(false)
    if (result.ok) setUsage(result.usage)
    else setError(result.message)
  }

  async function handleCopyUrl() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  /** Checks usage first (never a blind delete) so the confirm dialog is honest about what else might break. */
  async function handleDelete() {
    setError(null)
    const usageResult = await getAssetUsageAction(asset.id)
    const foundUsage = usageResult.ok ? usageResult.usage : []
    const warning =
      foundUsage.length > 0
        ? `Tệp "${asset.originalFilename}" đang được dùng ở ${foundUsage.length} nơi:\n${foundUsage.map((u) => `- ${u.label}`).join('\n')}\n\nXoá vẫn tiếp tục — các nơi trên có thể mất ảnh. Vẫn xoá?`
        : `Xoá tệp "${asset.originalFilename}"? Chưa thấy được dùng ở đâu. Hành động này ẩn tệp khỏi Media Library (soft-delete).`
    if (!window.confirm(warning)) return
    setDeleting(true)
    const result = await deleteAssetAction(asset.id)
    setDeleting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setDeleted(true)
    router.refresh()
  }

  if (deleted) return null

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
        {asset.checksum && (
          <p className="truncate text-[10px] text-muted-foreground/70" title={asset.checksum}>
            SHA-256: {asset.checksum.slice(0, 12)}…
          </p>
        )}
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
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleUsage}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            {loadingUsage ? <Loader2 className="size-3 animate-spin" /> : <Link2 className="size-3" />}
            {showUsage ? 'Ẩn nơi sử dụng' : 'Xem nơi sử dụng'}
          </button>
          {url && (
            <button type="button" onClick={handleCopyUrl} className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? 'Đã sao chép' : 'Copy URL'}
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="flex items-center gap-1 text-[11px] font-semibold text-destructive hover:underline disabled:opacity-50"
            >
              {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
              Xoá
            </button>
          )}
        </div>
      </div>

      {showUsage && (
        <div className="space-y-1.5 border-t border-border bg-secondary/20 p-3 text-xs">
          {loadingUsage ? (
            <p className="text-muted-foreground">Đang tìm...</p>
          ) : usage && usage.length > 0 ? (
            <>
              <ul className="space-y-1">
                {usage.map((u, i) => (
                  <li key={i} className="text-foreground">
                    {u.href ? (
                      <Link href={u.href} className="text-primary hover:underline">
                        {u.label}
                      </Link>
                    ) : (
                      u.label
                    )}
                  </li>
                ))}
              </ul>
              {usage.some((u) => u.type === 'cms_block') && (
                <p className="text-[10px] text-muted-foreground/70">
                  Kết quả từ nội dung block chỉ mang tính tương đối (tìm kiếm theo đường dẫn tệp), có thể không đầy đủ 100%.
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Chưa thấy asset này được dùng ở đâu.</p>
          )}
        </div>
      )}

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

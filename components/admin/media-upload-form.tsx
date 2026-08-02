'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, AlertCircle } from 'lucide-react'
import { getBrowserSupabaseClient } from '@/shared/supabase/browser-client'
import { computeFileChecksum } from '@/lib/media/checksum'
import { MVButton } from '@/components/mv/mv-button'

function bucketFor(visibility: 'PUBLIC' | 'PRIVATE') {
  return visibility === 'PUBLIC' ? 'media-public' : 'media-private'
}

function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

export function MediaUploadForm({ folderId, maxUploadSizeMb }: { folderId?: string; maxUploadSizeMb: number }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const maxBytes = maxUploadSizeMb * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`Tệp vượt quá giới hạn ${maxUploadSizeMb}MB (cấu hình tại Settings → Storage).`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setUploading(true)
    setError(null)
    try {
      const bucket = bucketFor(visibility)
      const storagePath = `${crypto.randomUUID()}-${file.name}`.replace(/\s+/g, '-')
      const supabase = getBrowserSupabaseClient()
      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file)
      if (uploadError) {
        setError(`Tải lên thất bại: ${uploadError.message}`)
        return
      }

      const [dimensions, checksum] = await Promise.all([readImageDimensions(file), computeFileChecksum(file)])

      const res = await fetch('/api/v1/media/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderId,
          originalFilename: file.name,
          storagePath,
          visibility,
          mimeType: file.type || 'application/octet-stream',
          fileSizeBytes: file.size,
          checksum,
          ...(dimensions ?? {}),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error?.message ?? 'Không thể lưu metadata tệp.')
        return
      }
      router.refresh()
    } catch {
      setError('Có lỗi xảy ra khi tải lên.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/20 p-4">
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm"
      >
        <option value="PUBLIC">Công khai</option>
        <option value="PRIVATE">Riêng tư</option>
      </select>
      <input ref={inputRef} type="file" onChange={handleFileChange} disabled={uploading} className="hidden" id="media-upload-input" />
      <MVButton
        type="button"
        size="sm"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        Tải tệp lên
      </MVButton>
      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </p>
      )}
    </div>
  )
}

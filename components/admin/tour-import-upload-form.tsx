'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, AlertCircle } from 'lucide-react'
import { getBrowserSupabaseClient } from '@/shared/supabase/browser-client'
import { computeFileChecksum } from '@/lib/media/checksum'
import { MVButton } from '@/components/mv/mv-button'
import { createImportJobAction, runImportJobAction } from '@/app/admin/tours/import-actions'

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/**
 * Uploads a .docx straight to the existing Media Library storage
 * (media-private bucket, same path `MediaUploadForm` uses) so AI Import
 * reuses that infra verbatim, then creates + immediately runs an
 * `import_jobs` row against it. Word-only, matching the confirmed Sprint
 * 7 Phase 0 scope — PDF/Excel intentionally rejected here rather than
 * silently accepted and failed deep in the pipeline.
 */
export function TourImportUploadForm({ websiteId }: { websiteId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== DOCX_MIME_TYPE && !file.name.toLowerCase().endsWith('.docx')) {
      setError('Chỉ hỗ trợ tệp Word (.docx).')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setUploading(true)
    setError(null)
    try {
      const storagePath = `import/${crypto.randomUUID()}-${file.name}`.replace(/\s+/g, '-')
      const supabase = getBrowserSupabaseClient()
      const { error: uploadError } = await supabase.storage.from('media-private').upload(storagePath, file)
      if (uploadError) {
        setError(`Tải lên thất bại: ${uploadError.message}`)
        return
      }

      const checksum = await computeFileChecksum(file)
      const assetRes = await fetch('/api/v1/media/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalFilename: file.name,
          storagePath,
          visibility: 'PRIVATE',
          mimeType: DOCX_MIME_TYPE,
          fileSizeBytes: file.size,
          checksum,
        }),
      })
      if (!assetRes.ok) {
        const body = await assetRes.json().catch(() => null)
        setError(body?.error?.message ?? 'Không thể lưu metadata tệp.')
        return
      }
      const assetBody = await assetRes.json()
      const mediaAssetId: string = assetBody.data.id

      const jobResult = await createImportJobAction({ websiteId, sourceMediaAssetId: mediaAssetId })
      if (!jobResult.ok) {
        setError(jobResult.message)
        return
      }
      await runImportJobAction(jobResult.job.id)
      router.push(`/admin/tours/import/${jobResult.job.id}`)
    } catch {
      setError('Có lỗi xảy ra khi tải lên.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/20 p-4">
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
        id="tour-import-upload-input"
      />
      <MVButton type="button" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="size-4" />
        {uploading ? 'Đang xử lý...' : 'Tải tệp Word (.docx)'}
      </MVButton>
      <p className="text-xs text-muted-foreground">AI sẽ trích xuất nội dung tour từ tài liệu để tạo bản nháp — cần kiểm duyệt trước khi xuất bản.</p>
      {error && (
        <p className="flex w-full items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </p>
      )}
    </div>
  )
}

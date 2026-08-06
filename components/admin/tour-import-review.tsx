'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Check, X } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { ImportJobStatusBadge } from '@/components/admin/import-job-status-badge'
import { runImportJobAction, approveImportDraftAction, rejectImportJobAction } from '@/app/admin/tours/import-actions'
import type { ImportJob, ImportDraft } from '@/modules/ai-import/domain/types'

type TourDraftData = {
  title?: string
  country?: string
  departureCity?: string
  body?: string
  itinerary?: { day: number; title: string; description: string }[]
  inclusions?: string[]
  exclusions?: string[]
  cancellationNote?: string
  suggestedCategoryName?: string
}

const RUNNABLE = new Set(['UPLOADED', 'FAILED'])
const APPROVABLE = new Set(['DRAFT_READY', 'IN_REVIEW'])

export function TourImportReview({ job, draft, websiteId }: { job: ImportJob; draft: ImportDraft | null; websiteId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const data = (draft?.data ?? {}) as TourDraftData

  function run() {
    setError(null)
    startTransition(async () => {
      const result = await runImportJobAction(job.id)
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  function approve() {
    setError(null)
    startTransition(async () => {
      const result = await approveImportDraftAction(job.id, websiteId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push(`/admin/cms/${result.pageId}`)
    })
  }

  function reject() {
    if (!window.confirm('Từ chối bản nháp này? Bạn có thể tải lại tài liệu khác sau.')) return
    setError(null)
    startTransition(async () => {
      const result = await rejectImportJobAction(job.id)
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <ImportJobStatusBadge status={job.status} />
          <span className="text-sm text-muted-foreground">Tạo lúc {new Date(job.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2">
          {RUNNABLE.has(job.status) && (
            <MVButton size="sm" variant="outline" loading={isPending} onClick={run}>
              <RefreshCw className="size-4" />
              {job.status === 'FAILED' ? 'Chạy lại' : 'Bắt đầu phân tích'}
            </MVButton>
          )}
          {APPROVABLE.has(job.status) && (
            <>
              <MVButton size="sm" variant="outline" loading={isPending} onClick={reject}>
                <X className="size-4" />
                Từ chối
              </MVButton>
              <MVButton size="sm" loading={isPending} onClick={approve}>
                <Check className="size-4" />
                Duyệt &amp; Tạo tour
              </MVButton>
            </>
          )}
          {job.status === 'PUBLISHED' && job.publishedPageId && (
            <Link href={`/admin/cms/${job.publishedPageId}`} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-deep">
              Mở tour đã tạo
            </Link>
          )}
        </div>
      </div>

      {job.errorMessage && (
        <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {job.errorMessage}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      {draft && (
        <>
          {draft.validationErrors.length > 0 && (
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <p className="text-sm font-semibold text-foreground">Cần bổ sung trước khi duyệt:</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {draft.validationErrors.map((issue, i) => (
                  <li key={i}>• {issue.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Tên tour</p>
              <p className="text-base font-semibold text-foreground">{data.title || '—'}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Quốc gia / khu vực</p>
                <p className="text-sm text-foreground">{data.country || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Điểm khởi hành</p>
                <p className="text-sm text-foreground">{data.departureCity || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Danh mục gợi ý</p>
                <p className="text-sm text-foreground">{data.suggestedCategoryName || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Mô tả tổng quan</p>
              <p className="text-sm text-foreground">{data.body || '—'}</p>
            </div>
          </div>

          {data.itinerary && data.itinerary.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-3 text-sm font-semibold text-foreground">Lịch trình ({data.itinerary.length} ngày)</p>
              <ol className="space-y-2">
                {data.itinerary.map((d) => (
                  <li key={d.day} className="text-sm">
                    <span className="font-semibold text-foreground">Ngày {d.day}: {d.title}</span>
                    <span className="text-muted-foreground"> — {d.description}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {((data.inclusions?.length ?? 0) > 0 || (data.exclusions?.length ?? 0) > 0) && (
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Bao gồm</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(data.inclusions ?? []).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Không bao gồm</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {(data.exclusions ?? []).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {!draft && !RUNNABLE.has(job.status) && (
        <p className="text-sm text-muted-foreground">Chưa có bản nháp cho lượt nhập này.</p>
      )}
    </div>
  )
}

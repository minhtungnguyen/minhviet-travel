'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { runSchedulerAction } from '@/app/admin/cms/scheduler/actions'

export function SchedulerPanel({
  websiteId,
  initialDue,
  initialNotDueYet,
}: {
  websiteId: string
  initialDue: number
  initialNotDueYet: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ published: number; notDueYet: number; errors: { versionId: string; message: string }[] } | null>(
    null,
  )

  function handleRun() {
    if (!window.confirm(`Xuất bản ${initialDue} nội dung đã đến hạn? Hành động này không thể hoàn tác.`)) return
    setError(null)
    startTransition(async () => {
      const res = await runSchedulerAction(websiteId)
      if (!res.ok) {
        setError(res.message)
        return
      }
      setResult({ published: res.published, notDueYet: res.notDueYet, errors: res.errors })
      router.refresh()
    })
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-secondary/40 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{initialDue}</p>
          <p className="text-xs text-muted-foreground">Đã đến hạn xuất bản</p>
        </div>
        <div className="rounded-lg bg-secondary/40 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{initialNotDueYet}</p>
          <p className="text-xs text-muted-foreground">Chưa đến hạn</p>
        </div>
      </div>

      <MVButton size="sm" loading={isPending} disabled={initialDue === 0} onClick={handleRun}>
        Kiểm tra lịch xuất bản
      </MVButton>

      {result && (
        <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-primary" />
            Đã xuất bản {result.published} nội dung. Còn {result.notDueYet} nội dung chưa đến hạn.
          </p>
          {result.errors.length > 0 && (
            <div className="space-y-1 text-xs text-destructive">
              <p className="font-semibold">{result.errors.length} lỗi:</p>
              {result.errors.map((e) => (
                <p key={e.versionId}>
                  Version {e.versionId}: {e.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

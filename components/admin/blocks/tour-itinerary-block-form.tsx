'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'

export type ItineraryDay = { day: number; title: string; description: string }
export type TourItineraryConfig = { days: ItineraryDay[] }

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

/**
 * Day-by-day itinerary editor for the `itinerary` section — reuses the
 * generic block/section machinery (uses the already-seeded TIMELINE
 * block-definition key, no new block type), same shape as the itinerary
 * days already live in lib/tours/tour-detail-content.ts's
 * itineraryDaySchema (day/title/description), so Phase 6 can migrate
 * that hardcoded content into this block config as-is.
 */
export function TourItineraryBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: TourItineraryConfig }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState<ItineraryDay[]>(initial.days.length > 0 ? initial.days : [])

  function addDay() {
    setDays((prev) => [...prev, { day: prev.length + 1, title: '', description: '' }])
  }
  function removeDay(index: number) {
    setDays((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })))
  }
  function moveDay(index: number, delta: number) {
    setDays((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next.map((d, i) => ({ ...d, day: i + 1 }))
    })
  }
  function updateDay(index: number, patch: Partial<ItineraryDay>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateBlockConfigAction(pageId, blockId, { days } as unknown as Record<string, unknown>)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {days.length === 0 && (
        <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          Chưa có ngày nào trong lịch trình — bắt buộc phải có ít nhất 1 ngày trước khi xuất bản.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}

      <div className="space-y-3">
        {days.map((d, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Ngày {d.day}</span>
              <div className="flex items-center gap-1">
                <button type="button" disabled={i === 0} onClick={() => moveDay(i, -1)} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Lên">
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={i === days.length - 1}
                  onClick={() => moveDay(i, 1)}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Xuống"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button type="button" onClick={() => removeDay(i)} className="p-1 text-muted-foreground hover:text-destructive" aria-label="Xoá ngày">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <label className="block">
              <span className={labelClass}>Tiêu đề ngày</span>
              <input className={inputClass} value={d.title} onChange={(e) => updateDay(i, { title: e.target.value })} placeholder="VD: Hà Nội – Đà Lạt" />
            </label>
            <label className="block">
              <span className={labelClass}>Mô tả</span>
              <textarea
                className={`${inputClass} h-auto py-2 font-sans`}
                rows={3}
                value={d.description}
                onChange={(e) => updateDay(i, { description: e.target.value })}
              />
            </label>
          </div>
        ))}
      </div>

      <MVButton size="sm" variant="outline" onClick={addDay}>
        <Plus className="size-3.5" /> Thêm ngày
      </MVButton>
      <MVButton size="sm" loading={isPending} onClick={handleSave} className="ml-2">
        Lưu
      </MVButton>
    </div>
  )
}

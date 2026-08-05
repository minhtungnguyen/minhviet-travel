'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { assignTourDestinationsAction } from '@/app/admin/tours/taxonomy-actions'

export type PickableDestination = { id: string; name: string }

/** Which destinations (existing master-data table) a Tour visits, in itinerary order — shown inside the shared Pages editor only when the page is a Tour. */
export function TourDestinationPicker({
  pageId,
  websiteId,
  destinations,
  currentDestinationIds,
}: {
  pageId: string
  websiteId: string
  destinations: PickableDestination[]
  currentDestinationIds: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [ordered, setOrdered] = useState<string[]>(currentDestinationIds)
  const [addId, setAddId] = useState('')

  const byId = new Map(destinations.map((d) => [d.id, d]))
  const available = destinations.filter((d) => !ordered.includes(d.id))

  function add() {
    if (!addId) return
    setOrdered((prev) => [...prev, addId])
    setAddId('')
  }
  function remove(id: string) {
    setOrdered((prev) => prev.filter((x) => x !== id))
  }
  function move(index: number, delta: number) {
    setOrdered((prev) => {
      const next = [...prev]
      const target = index + delta
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await assignTourDestinationsAction(pageId, ordered, websiteId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div>
      <h2 className="mb-2 font-display text-base font-semibold text-foreground">Điểm đến</h2>
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {error && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}

        <div className="space-y-2">
          {ordered.map((id, i) => (
            <div key={id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <span className="w-5 shrink-0 text-xs text-muted-foreground">{i + 1}.</span>
              <span className="flex-1 text-foreground">{byId.get(id)?.name ?? id}</span>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Lên">
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                disabled={i === ordered.length - 1}
                onClick={() => move(i, 1)}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                aria-label="Xuống"
              >
                <ArrowDown className="size-3.5" />
              </button>
              <button type="button" onClick={() => remove(id)} className="p-1 text-muted-foreground hover:text-destructive" aria-label="Xoá">
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {ordered.length === 0 && <p className="text-sm text-muted-foreground">Chưa có điểm đến nào.</p>}
        </div>

        <div className="flex gap-2">
          <select
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
          >
            <option value="">Chọn điểm đến để thêm...</option>
            {available.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <MVButton size="sm" variant="outline" onClick={add} disabled={!addId}>
            <Plus className="size-3.5" /> Thêm
          </MVButton>
        </div>

        <MVButton size="sm" loading={isPending} onClick={handleSave}>
          Lưu
        </MVButton>
      </div>
    </div>
  )
}

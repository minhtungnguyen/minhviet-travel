'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'

export type TourPolicyConfig = { inclusions: string[]; exclusions: string[]; cancellationNote: string }

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

function StringListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="mt-1 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              value={item}
              onChange={(e) => onChange(items.map((it, idx) => (idx === i ? e.target.value : it)))}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="p-1.5 text-muted-foreground hover:text-destructive"
              aria-label={`Xoá ${label}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Plus className="size-3.5" /> Thêm dòng
        </button>
      </div>
    </div>
  )
}

/**
 * Inclusions/exclusions/cancellation-note editor for the `policy`
 * section — flat string lists, not a relational table (unlike
 * categories/destinations/departures), same reasoning as News' excerpt:
 * read whole, rendered whole, no filtering/joining need. Company-wide
 * default payment/cancellation policy stays in Settings
 * (lib/tours/tour-detail-content.ts's standardCancellationPolicy today);
 * `cancellationNote` here is a per-tour override/addition, not a
 * required field.
 */
export function TourPolicyBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: TourPolicyConfig }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [inclusions, setInclusions] = useState<string[]>(initial.inclusions)
  const [exclusions, setExclusions] = useState<string[]>(initial.exclusions)
  const [cancellationNote, setCancellationNote] = useState(initial.cancellationNote)

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateBlockConfigAction(pageId, blockId, {
        inclusions: inclusions.filter((s) => s.trim()),
        exclusions: exclusions.filter((s) => s.trim()),
        cancellationNote,
      } as unknown as Record<string, unknown>)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <StringListEditor label="Bao gồm" items={inclusions} onChange={setInclusions} />
      <StringListEditor label="Không bao gồm" items={exclusions} onChange={setExclusions} />
      <label className="block">
        <span className={labelClass}>Ghi chú huỷ/đổi lịch riêng cho tour này (không bắt buộc)</span>
        <textarea
          className={`${inputClass} h-auto py-2 font-sans`}
          rows={3}
          value={cancellationNote}
          onChange={(e) => setCancellationNote(e.target.value)}
          placeholder="Bỏ trống để áp dụng chính sách huỷ chung của công ty."
        />
      </label>
      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

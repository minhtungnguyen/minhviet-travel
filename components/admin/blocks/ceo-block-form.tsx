'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { MediaPickerInput } from '@/components/admin/media-picker-input'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'
import type { CeoSectionContent } from '@/types/homepage'

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

export function CeoBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: CeoSectionContent }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initial)

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateBlockConfigAction(pageId, blockId, form as unknown as Record<string, unknown>)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {(!form.quote || !form.name) && (
        <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          Section này chưa hiển thị trên trang chủ vì chưa có tên và trích dẫn. Điền đủ hai trường bên dưới rồi Lưu và Xuất bản để hiển thị.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <label className="block">
        <span className={labelClass}>Eyebrow</span>
        <input className={inputClass} value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} />
      </label>
      <label className="block">
        <span className={labelClass}>Trích dẫn</span>
        <textarea
          className={`${inputClass} h-auto py-2`}
          rows={3}
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Họ tên</span>
          <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </label>
        <label className="block">
          <span className={labelClass}>Chức danh</span>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </label>
      </div>
      <div>
        <span className={labelClass}>Ảnh chân dung</span>
        <div className="mt-1">
          <MediaPickerInput value={form.portrait} onChange={(img) => setForm((f) => ({ ...f, portrait: img }))} altPlaceholder={form.name} />
        </div>
      </div>
      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

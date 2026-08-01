'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { MediaPickerInput } from '@/components/admin/media-picker-input'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'
import type { CmsImage } from '@/types/cms'

export type NewsMetaConfig = { category: string; excerpt: string; image: CmsImage | null; size: 'large' | 'small' }

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

/**
 * The one new block-type form Phase 4 adds (Founder decision: Pages/News
 * scope is Create/Delete + this form only, no other block-type forms).
 * Edits the `meta` section's block config that `lib/cms/news.ts` reads
 * (`category`/`excerpt`/`image`/`size`) — title and publish date already
 * live on `cms_page_versions`, not duplicated here.
 */
export function NewsMetaBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: NewsMetaConfig }) {
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
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <label className="block">
        <span className={labelClass}>Chuyên mục</span>
        <input className={inputClass} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
      </label>
      <label className="block">
        <span className={labelClass}>Tóm tắt (excerpt)</span>
        <textarea
          className={`${inputClass} h-auto py-2`}
          rows={3}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Kích thước hiển thị (trang chủ)</span>
        <select className={inputClass} value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value as 'large' | 'small' }))}>
          <option value="small">Nhỏ</option>
          <option value="large">Lớn</option>
        </select>
      </label>
      <div>
        <span className={labelClass}>Ảnh đại diện</span>
        <div className="mt-1">
          <MediaPickerInput value={form.image} onChange={(img) => setForm((f) => ({ ...f, image: img }))} altPlaceholder={form.category} />
        </div>
      </div>
      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

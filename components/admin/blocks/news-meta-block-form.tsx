'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { MediaPickerInput } from '@/components/admin/media-picker-input'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'
import type { CmsImage } from '@/types/cms'

/**
 * Sprint 5A: `category` moved out of this JSON config into a real
 * relational table (`news_categories`/`news_article_categories`) per
 * Founder decision ("do not use JSON storage for categories") — see
 * `components/admin/news-category-picker.tsx` for the category selector,
 * rendered alongside this form in the Pages editor, not inside it.
 */
export type NewsMetaConfig = {
  excerpt: string
  image: CmsImage | null
  size: 'large' | 'small'
  featured: boolean
  hot: boolean
  pinned: boolean
  tags?: string[]
}

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

/**
 * The one new block-type form Phase 4 adds (Founder decision: Pages/News
 * scope is Create/Delete + this form only, no other block-type forms).
 * Edits the `meta` section's block config that `lib/cms/news.ts` reads
 * (`excerpt`/`image`/`size`/`featured`/`hot`/`pinned`) — title and publish
 * date already live on `cms_page_versions`, not duplicated here.
 */
export function NewsMetaBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: NewsMetaConfig }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initial)
  const [tagsInput, setTagsInput] = useState((initial.tags ?? []).join(', '))

  function handleSave() {
    setError(null)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    startTransition(async () => {
      const result = await updateBlockConfigAction(pageId, blockId, { ...form, tags } as unknown as Record<string, unknown>)
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
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
          Nổi bật (Featured)
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={form.hot} onChange={(e) => setForm((f) => ({ ...f, hot: e.target.checked }))} />
          Hot
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))} />
          Ghim (Pinned)
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Tags (cách nhau bằng dấu phẩy)</span>
        <input className={inputClass} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="mice, du-thuyen, hai-phong" />
      </label>
      <div>
        <span className={labelClass}>Ảnh đại diện</span>
        <div className="mt-1">
          <MediaPickerInput value={form.image} onChange={(img) => setForm((f) => ({ ...f, image: img }))} altPlaceholder="" />
        </div>
      </div>
      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

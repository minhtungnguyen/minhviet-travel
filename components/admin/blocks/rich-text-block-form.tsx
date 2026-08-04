'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'

export type RichTextConfig = { title?: string; body: string }

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

/**
 * Plain-textarea editor for the `RICH_TEXT` block — reuses the block
 * definition/renderer that already existed (`CmsGenericPageRenderer`
 * splits `body` on blank lines into paragraphs), not a new rich-text
 * editor library. Used for the News article body.
 */
export function RichTextBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: RichTextConfig }) {
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
      {!form.body.trim() && (
        <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          Nội dung đang trống — bắt buộc phải điền trước khi xuất bản.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <label className="block">
        <span className={labelClass}>Nội dung bài viết</span>
        <textarea
          className={`${inputClass} h-auto py-2 font-sans`}
          rows={16}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          placeholder={'Viết nội dung ở đây. Để trống 1 dòng giữa các đoạn văn.'}
        />
      </label>
      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

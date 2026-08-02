'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { assignArticleCategoryAction } from '@/app/admin/news/categories/actions'
import type { NewsCategory } from '@/modules/news-categories/domain/types'

/** Article -> category assignment for an existing News article — shown inside the shared Pages editor only when the page is News. */
export function NewsCategoryPicker({
  pageId,
  websiteId,
  categories,
  currentCategoryId,
}: {
  pageId: string
  websiteId: string
  categories: NewsCategory[]
  currentCategoryId: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState(currentCategoryId ?? categories[0]?.id ?? '')

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await assignArticleCategoryAction(pageId, categoryId, websiteId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div>
      <h2 className="mb-2 font-display text-base font-semibold text-foreground">Danh mục</h2>
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        {error && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
        <div className="flex gap-2">
          <select
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <MVButton size="sm" loading={isPending} onClick={handleSave}>
            Lưu
          </MVButton>
        </div>
      </div>
    </div>
  )
}

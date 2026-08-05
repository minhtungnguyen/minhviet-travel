'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { assignTourCategoriesAction } from '@/app/admin/tours/taxonomy-actions'
import type { TourCategory } from '@/modules/tour-categories/domain/types'

/** Tour -> category assignment (many-to-many, unlike News' single-select NewsCategoryPicker) — shown inside the shared Pages editor only when the page is a Tour. */
export function TourCategoryPicker({
  pageId,
  websiteId,
  categories,
  currentCategoryIds,
}: {
  pageId: string
  websiteId: string
  categories: TourCategory[]
  currentCategoryIds: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set(currentCategoryIds))

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await assignTourCategoriesAction(pageId, [...selected], websiteId)
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
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {error && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Chưa có danh mục nào. Tạo ở trang{' '}
            <Link href="/admin/tours/categories" className="text-primary hover:underline">
              Danh mục tour
            </Link>
            .
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                selected.has(c.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              <input type="checkbox" className="hidden" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
              {c.name}
            </label>
          ))}
        </div>
        <MVButton size="sm" loading={isPending} onClick={handleSave}>
          Lưu
        </MVButton>
      </div>
    </div>
  )
}

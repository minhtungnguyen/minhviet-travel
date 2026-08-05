'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Trash2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { createTourCategoryAction, deleteTourCategoryAction, updateTourCategoryAction } from '@/app/admin/tours/categories/actions'
import type { TourCategory } from '@/modules/tour-categories/domain/types'

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

function CategoryRow({ category, canWrite }: { category: TourCategory; canWrite: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [description, setDescription] = useState(category.description ?? '')

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateTourCategoryAction(category.id, { name, slug, description: description || undefined })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setEditing(false)
      router.refresh()
    })
  }

  function handleToggleActive() {
    setError(null)
    startTransition(async () => {
      const result = await updateTourCategoryAction(category.id, { isActive: !category.isActive })
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  function handleDelete() {
    if (!window.confirm(`Xoá hẳn danh mục "${category.name}"? Không thể xoá nếu còn tour đang dùng.`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteTourCategoryAction(category.id)
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        {error && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên" />
        <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
        <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả (không bắt buộc)" />
        <div className="flex gap-2">
          <MVButton size="sm" loading={isPending} onClick={handleSave}>
            Lưu
          </MVButton>
          <MVButton size="sm" variant="outline" onClick={() => setEditing(false)}>
            Huỷ
          </MVButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{category.name}</p>
        <p className="text-xs text-muted-foreground">/{category.slug}</p>
      </div>
      {canWrite && (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleToggleActive}
            className={
              category.isActive
                ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                : 'rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
            }
          >
            {category.isActive ? 'Đang hiện' : 'Đã tắt'}
          </button>
          <button type="button" disabled={isPending} onClick={() => setEditing(true)} className="text-xs font-semibold text-primary hover:underline">
            Sửa
          </button>
          <button type="button" disabled={isPending} onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Xoá">
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export function TourCategoriesPanel({
  websiteId,
  categories,
  canWrite,
}: {
  websiteId: string
  categories: TourCategory[]
  canWrite: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createTourCategoryAction({ websiteId, name, slug, sortOrder: categories.length })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setName('')
      setSlug('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      {canWrite && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold text-foreground">Tạo danh mục mới</h2>
          <label className="block">
            <span className={labelClass}>Tên</span>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block">
            <span className={labelClass}>Slug</span>
            <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </label>
          <MVButton type="submit" size="sm" loading={isPending}>
            Tạo
          </MVButton>
        </form>
      )}

      <div className="space-y-3">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} canWrite={canWrite} />
        ))}
        {categories.length === 0 && <p className="text-sm text-muted-foreground">Chưa có danh mục nào.</p>}
      </div>
    </div>
  )
}

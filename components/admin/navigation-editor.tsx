'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import {
  createItemAction,
  createMenuAction,
  deleteItemAction,
  moveItemAction,
  updateItemAction,
  updateMenuStatusAction,
  type ActionResult,
} from '@/app/admin/navigation/actions'
import type { NavigationItem, NavigationMenu, NavigationMenuKey } from '@/modules/navigation/domain/types'

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

function ItemRow({
  item,
  pages,
  index,
  total,
  onMove,
}: {
  item: NavigationItem
  pages: { id: string; slug: string }[]
  index: number
  total: number
  onMove: (direction: -1 | 1) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [label, setLabel] = useState(item.label)
  const [targetKind, setTargetKind] = useState<'page' | 'url'>(item.cmsPageId ? 'page' : 'url')
  const [cmsPageId, setCmsPageId] = useState(item.cmsPageId ?? pages[0]?.id ?? '')
  const [url, setUrl] = useState(item.url ?? '')
  const [openInNewTab, setOpenInNewTab] = useState(item.openInNewTab)

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message)
        return
      }
      onSuccess?.()
      router.refresh()
    })
  }

  function handleSave() {
    run(
      () =>
        updateItemAction(item.id, {
          label,
          cmsPageId: targetKind === 'page' ? cmsPageId : null,
          url: targetKind === 'url' ? url : null,
          isExternal: targetKind === 'url' && /^https?:\/\//.test(url),
          openInNewTab,
        }),
      () => setEditing(false),
    )
  }

  function handleToggleStatus() {
    run(() => updateItemAction(item.id, { status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }))
  }

  function handleDelete() {
    if (!window.confirm(`Xoá mục "${item.label}"?`)) return
    run(() => deleteItemAction(item.id))
  }

  const targetLabel = item.cmsPageId ? `/${pages.find((p) => p.id === item.cmsPageId)?.slug ?? '?'}` : (item.url ?? '—')

  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${item.parentItemId ? 'ml-6' : ''}`}>
      {error && (
        <p className="mb-2 flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      {editing ? (
        <div className="space-y-3">
          <label className="block">
            <span className={labelClass}>Nhãn</span>
            <input className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={targetKind === 'page'} onChange={() => setTargetKind('page')} /> Trang CMS
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={targetKind === 'url'} onChange={() => setTargetKind('url')} /> URL tuỳ ý
            </label>
          </div>
          {targetKind === 'page' ? (
            <select className={inputClass} value={cmsPageId} onChange={(e) => setCmsPageId(e.target.value)}>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  /{p.slug}
                </option>
              ))}
            </select>
          ) : (
            <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/lien-he hoặc https://..." />
          )}
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={openInNewTab} onChange={(e) => setOpenInNewTab(e.target.checked)} />
            Mở tab mới
          </label>
          <div className="flex gap-2">
            <MVButton size="sm" loading={isPending} onClick={handleSave}>
              Lưu
            </MVButton>
            <MVButton size="sm" variant="outline" onClick={() => setEditing(false)}>
              Huỷ
            </MVButton>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
            <p className="truncate text-xs text-muted-foreground">{targetLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={index === 0 || isPending}
              onClick={() => onMove(-1)}
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary/60 disabled:opacity-30"
              aria-label="Đưa lên"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              disabled={index === total - 1 || isPending}
              onClick={() => onMove(1)}
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary/60 disabled:opacity-30"
              aria-label="Đưa xuống"
            >
              <ArrowDown className="size-4" />
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleToggleStatus}
              className={
                item.status === 'ACTIVE'
                  ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                  : 'rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
              }
            >
              {item.status === 'ACTIVE' ? 'Đang hiện' : 'Đã tắt'}
            </button>
            <button type="button" disabled={isPending} onClick={() => setEditing(true)} className="text-xs font-semibold text-primary hover:underline">
              Sửa
            </button>
            <button type="button" disabled={isPending} onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Xoá">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateItemForm({ menuId, pages, nextPosition }: { menuId: string; pages: { id: string; slug: string }[]; nextPosition: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [targetKind, setTargetKind] = useState<'page' | 'url'>('page')
  const [cmsPageId, setCmsPageId] = useState(pages[0]?.id ?? '')
  const [url, setUrl] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createItemAction(menuId, {
        label,
        cmsPageId: targetKind === 'page' ? cmsPageId : undefined,
        url: targetKind === 'url' ? url : undefined,
        isExternal: targetKind === 'url' && /^https?:\/\//.test(url),
        openInNewTab: false,
        position: nextPosition,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setLabel('')
      setUrl('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-dashed border-border p-4">
      <h3 className="text-sm font-semibold text-foreground">Thêm mục mới</h3>
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <label className="block">
        <span className={labelClass}>Nhãn</span>
        <input className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)} required />
      </label>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={targetKind === 'page'} onChange={() => setTargetKind('page')} /> Trang CMS
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" checked={targetKind === 'url'} onChange={() => setTargetKind('url')} /> URL tuỳ ý
        </label>
      </div>
      {targetKind === 'page' ? (
        <select className={inputClass} value={cmsPageId} onChange={(e) => setCmsPageId(e.target.value)}>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              /{p.slug}
            </option>
          ))}
        </select>
      ) : (
        <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/lien-he hoặc https://..." required />
      )}
      <MVButton type="submit" size="sm" loading={isPending}>
        Thêm
      </MVButton>
    </form>
  )
}

export function NavigationEditor({
  websiteId,
  menus,
  selectedMenu,
  items,
  pages,
  missingKeys,
}: {
  websiteId: string
  menus: NavigationMenu[]
  selectedMenu: NavigationMenu | null
  items: NavigationItem[]
  pages: { id: string; slug: string }[]
  missingKeys: NavigationMenuKey[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const sorted = [...items].sort((a, b) => a.position - b.position)

  function moveItem(index: number, direction: -1 | 1) {
    const other = sorted[index + direction]
    if (!other) return
    setError(null)
    startTransition(async () => {
      const result = await moveItemAction(sorted[index].id, other.position)
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  function handleCreateMenu(key: NavigationMenuKey) {
    setError(null)
    startTransition(async () => {
      const result = await createMenuAction({ websiteId, key, locale: 'vi' })
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  function handleToggleMenuStatus() {
    if (!selectedMenu) return
    setError(null)
    startTransition(async () => {
      const result = await updateMenuStatusAction(selectedMenu.id, selectedMenu.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <form className="flex items-center gap-2">
          <select
            name="menuId"
            defaultValue={selectedMenu?.id}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.key} ({m.locale})
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/60">
            Chọn menu
          </button>
        </form>
        {selectedMenu && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleToggleMenuStatus}
            className={
              selectedMenu.status === 'ACTIVE'
                ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                : 'rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
            }
          >
            Menu: {selectedMenu.status === 'ACTIVE' ? 'Đang hiện' : 'Đã tắt'}
          </button>
        )}
      </div>

      {missingKeys.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/30 p-3 text-xs text-muted-foreground">
          <span>Chưa có menu:</span>
          {missingKeys.map((key) => (
            <button
              key={key}
              type="button"
              disabled={isPending}
              onClick={() => handleCreateMenu(key)}
              className="rounded-full border border-border px-2.5 py-1 font-semibold text-primary hover:bg-secondary/60"
            >
              + {key}
            </button>
          ))}
        </div>
      )}

      {selectedMenu ? (
        <div className="space-y-3">
          {sorted.map((item, i) => (
            <ItemRow key={item.id} item={item} pages={pages} index={i} total={sorted.length} onMove={(dir) => moveItem(i, dir)} />
          ))}
          {sorted.length === 0 && <p className="text-sm text-muted-foreground">Menu này chưa có mục nào.</p>}
          <CreateItemForm menuId={selectedMenu.id} pages={pages} nextPosition={sorted.length} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Chưa có menu nào — tạo một menu ở trên để bắt đầu.</p>
      )}
    </div>
  )
}

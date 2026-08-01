'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Trash2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { createAnnouncementAction, deleteAnnouncementAction, updateAnnouncementAction } from '@/app/admin/cms/announcements/actions'
import type { Announcement } from '@/modules/cms/domain/types'

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

/** `datetime-local` inputs need "YYYY-MM-DDTHH:mm" with no timezone suffix — approximates from the stored ISO string for editing convenience. */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 16)
}

function AnnouncementRow({ announcement, canWrite }: { announcement: Announcement; canWrite: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState(announcement.message)
  const [linkHref, setLinkHref] = useState(announcement.linkHref ?? '')
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(announcement.startsAt))
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(announcement.endsAt))

  function toggleStatus() {
    setError(null)
    startTransition(async () => {
      const result = await updateAnnouncementAction(announcement.id, { status: announcement.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateAnnouncementAction(announcement.id, {
        message,
        linkHref: linkHref || undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setEditing(false)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!window.confirm('Xoá popup/thông báo này?')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteAnnouncementAction(announcement.id)
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  if (editing) {
    return (
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {error && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className={`${inputClass} h-auto py-2`}
        />
        <input className={inputClass} value={linkHref} onChange={(e) => setLinkHref(e.target.value)} placeholder="Link (không bắt buộc)" />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Bắt đầu</span>
            <input type="datetime-local" className={inputClass} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelClass}>Kết thúc</span>
            <input type="datetime-local" className={inputClass} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </label>
        </div>
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
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{announcement.message}</p>
        {announcement.linkHref && <p className="text-xs text-muted-foreground">{announcement.linkHref}</p>}
        {(announcement.startsAt || announcement.endsAt) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {announcement.startsAt ? new Date(announcement.startsAt).toLocaleString('vi-VN') : '…'}
            {' → '}
            {announcement.endsAt ? new Date(announcement.endsAt).toLocaleString('vi-VN') : '…'}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={
            announcement.status === 'ACTIVE'
              ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
              : 'rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
          }
        >
          {announcement.status === 'ACTIVE' ? 'Đang hiện' : 'Đã tắt'}
        </span>
        {canWrite && (
          <>
            <button type="button" disabled={isPending} onClick={toggleStatus} className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">
              {announcement.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
            </button>
            <button type="button" disabled={isPending} onClick={() => setEditing(true)} className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">
              Sửa
            </button>
            <button type="button" disabled={isPending} onClick={handleDelete} className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-50" aria-label="Xoá">
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function AnnouncementsPanel({
  websiteId,
  announcements,
  canWrite,
}: {
  websiteId: string
  announcements: Announcement[]
  canWrite: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [linkHref, setLinkHref] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createAnnouncementAction({
        websiteId,
        message,
        linkHref: linkHref || undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setMessage('')
      setLinkHref('')
      setStartsAt('')
      setEndsAt('')
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
          <h2 className="font-display text-base font-semibold text-foreground">Tạo popup / thông báo mới</h2>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nội dung thông báo..."
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            type="text"
            value={linkHref}
            onChange={(e) => setLinkHref(e.target.value)}
            placeholder="Link (không bắt buộc)"
            className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Bắt đầu (không bắt buộc)</span>
              <input type="datetime-local" className={inputClass} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </label>
            <label className="block">
              <span className={labelClass}>Kết thúc (không bắt buộc)</span>
              <input type="datetime-local" className={inputClass} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </label>
          </div>
          <MVButton type="submit" size="sm" loading={isPending}>
            Tạo
          </MVButton>
        </form>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <AnnouncementRow key={a.id} announcement={a} canWrite={canWrite} />
        ))}
        {announcements.length === 0 && <p className="text-sm text-muted-foreground">Chưa có popup/thông báo nào.</p>}
      </div>
    </div>
  )
}

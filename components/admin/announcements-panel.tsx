'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { createAnnouncementAction, updateAnnouncementAction } from '@/app/admin/cms/announcements/actions'
import type { Announcement } from '@/modules/cms/domain/types'

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

  function toggleStatus(a: Announcement) {
    setError(null)
    startTransition(async () => {
      const result = await updateAnnouncementAction(a.id, { status: a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createAnnouncementAction({
        websiteId,
        message,
        linkHref: linkHref || undefined,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setMessage('')
      setLinkHref('')
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
          <MVButton type="submit" size="sm" loading={isPending}>
            Tạo
          </MVButton>
        </form>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{a.message}</p>
              {a.linkHref && <p className="text-xs text-muted-foreground">{a.linkHref}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={
                  a.status === 'ACTIVE'
                    ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                    : 'rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
                }
              >
                {a.status === 'ACTIVE' ? 'Đang hiện' : 'Đã tắt'}
              </span>
              {canWrite && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => toggleStatus(a)}
                  className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {a.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                </button>
              )}
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-sm text-muted-foreground">Chưa có popup/thông báo nào.</p>}
      </div>
    </div>
  )
}

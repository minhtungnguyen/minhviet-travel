'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

const STORAGE_KEY_PREFIX = 'mv-announcement-dismissed-until:'
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000
const ANIMATION_MS = 240

/**
 * Native `<dialog>` (same choice as `components/homepage/video-modal.tsx`)
 * so focus trapping, Escape-to-close and a `::backdrop` come from the
 * platform instead of a new modal dependency. `visible` is toggled a frame
 * after `showModal()` (and back off before `close()`) purely to drive the
 * fade+scale transition — the dialog itself is already open/closed by then.
 *
 * Content is real (Sprint 2 "Popup management" — see
 * `announcement-modal-loader.tsx`), never a hardcoded maintenance notice.
 * The dismissal key is scoped to the message text itself, so a *new*
 * announcement always shows even if the visitor dismissed a previous one
 * within the last 24h.
 */
export function AnnouncementModal({ message, linkHref }: { message: string; linkHref: string | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [visible, setVisible] = useState(false)
  const storageKey = `${STORAGE_KEY_PREFIX}${message.slice(0, 80)}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    let dismissedUntil = 0
    try {
      dismissedUntil = Number(window.localStorage.getItem(storageKey)) || 0
    } catch {
      dismissedUntil = 0
    }

    if (Date.now() >= dismissedUntil) {
      dialog.showModal()
      requestAnimationFrame(() => setVisible(true))
    }
  }, [storageKey])

  const dismiss = () => {
    try {
      window.localStorage.setItem(storageKey, String(Date.now() + DISMISS_DURATION_MS))
    } catch {
      // Storage unavailable (private mode, disabled cookies) — the modal
      // will simply reappear next visit, which is an acceptable fallback.
    }
    setVisible(false)
    window.setTimeout(() => dialogRef.current?.close(), ANIMATION_MS)
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        dismiss()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) dismiss()
      }}
      aria-labelledby="announcement-modal-title"
      className={`m-auto w-[min(480px,92vw)] overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-soft-lg outline-none backdrop:bg-primary/70 open:backdrop:backdrop-blur-md transition-all duration-mv-normal ease-mv-standard ${
        visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
    >
      <div className="p-6 sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Sparkles className="size-6" />
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Đóng thông báo"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-mv-fast hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="eyebrow text-[11px] font-semibold text-accent">Thông báo</p>
        <p
          id="announcement-modal-title"
          className="mt-2 text-pretty font-display text-lg leading-snug text-primary sm:text-xl"
        >
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <MVButton variant="primary" size="md" onClick={dismiss} className="w-full sm:flex-1">
            Đóng
          </MVButton>
          {linkHref && (
            <MVButton href={linkHref} onClick={dismiss} variant="accent" size="md" className="w-full sm:flex-1">
              Xem chi tiết
            </MVButton>
          )}
        </div>
      </div>
    </dialog>
  )
}

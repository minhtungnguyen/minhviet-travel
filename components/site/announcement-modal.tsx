'use client'

import { useEffect, useRef, useState } from 'react'
import { Phone, Sparkles, X } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

const STORAGE_KEY = 'mv-announcement-dismissed-until'
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000
const ANIMATION_MS = 240
const PRIMARY_PHONE = '0934368132'
const SECONDARY_PHONE = '0973421858'

/**
 * Native `<dialog>` (same choice as `components/homepage/video-modal.tsx`)
 * so focus trapping, Escape-to-close and a `::backdrop` come from the
 * platform instead of a new modal dependency. `visible` is toggled a frame
 * after `showModal()` (and back off before `close()`) purely to drive the
 * fade+scale transition — the dialog itself is already open/closed by then.
 */
export function AnnouncementModal() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    let dismissedUntil = 0
    try {
      dismissedUntil = Number(window.localStorage.getItem(STORAGE_KEY)) || 0
    } catch {
      dismissedUntil = 0
    }

    if (Date.now() >= dismissedUntil) {
      dialog.showModal()
      requestAnimationFrame(() => setVisible(true))
    }
  }, [])

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS))
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
        // Escape closes natively and instantly — intercept so the same
        // fade-out + 24h persistence path runs as every other close.
        event.preventDefault()
        dismiss()
      }}
      onClick={(event) => {
        // The backdrop click lands on the <dialog> element itself; content
        // sits in a child wrapper, so this only fires for real backdrop clicks.
        if (event.target === dialogRef.current) dismiss()
      }}
      aria-labelledby="announcement-modal-title"
      className={`m-auto w-[min(560px,92vw)] overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-soft-lg outline-none backdrop:bg-primary/70 open:backdrop:backdrop-blur-md transition-all duration-mv-normal ease-mv-standard ${
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
        <h2
          id="announcement-modal-title"
          className="mt-2 text-balance font-display text-xl font-bold leading-snug text-primary sm:text-2xl"
        >
          Minh Việt Travel đang nâng cấp hệ thống
        </h2>

        <div className="mt-4 space-y-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          <p>Kính chào Quý khách,</p>
          <p>
            Chúng tôi đang nâng cấp website Minh Việt Travel nhằm mang đến trải nghiệm đặt dịch vụ nhanh hơn, thông
            minh hơn và thuận tiện hơn.
          </p>
          <p>
            Trong thời gian này, một số nội dung, chương trình và tính năng trên website vẫn đang trong quá trình
            hoàn thiện, vì vậy có thể chưa phản ánh đầy đủ các sản phẩm và mức giá hiện hành.
          </p>
          <p>Để được tư vấn và hỗ trợ nhanh nhất, Quý khách vui lòng liên hệ trực tiếp với chúng tôi:</p>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-y border-border py-4 sm:flex-row sm:items-center sm:gap-6">
          <a
            href={`tel:${PRIMARY_PHONE}`}
            onClick={dismiss}
            className="flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
          >
            <Phone className="size-4 text-accent" /> 0934 368 132
          </a>
          <a
            href={`tel:${SECONDARY_PHONE}`}
            onClick={dismiss}
            className="flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
          >
            <Phone className="size-4 text-accent" /> 0973 421 858
          </a>
        </div>

        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
          Xin chân thành cảm ơn Quý khách đã thông cảm và đồng hành cùng Minh Việt Travel.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <MVButton variant="primary" size="md" onClick={dismiss} className="w-full sm:flex-1">
            Tiếp tục vào website
          </MVButton>

          {/* Mobile / tablet: one call action, to the primary hotline */}
          <MVButton href={`tel:${PRIMARY_PHONE}`} onClick={dismiss} variant="accent" size="md" className="w-full lg:hidden">
            <Phone className="size-4" /> Gọi ngay
          </MVButton>

          {/* Desktop: both hotlines available as direct call actions */}
          <div className="hidden gap-3 lg:flex lg:flex-1">
            <MVButton href={`tel:${PRIMARY_PHONE}`} onClick={dismiss} variant="accent" size="md" className="flex-1">
              <Phone className="size-4" /> 0934 368 132
            </MVButton>
            <MVButton href={`tel:${SECONDARY_PHONE}`} onClick={dismiss} variant="outline" size="md" className="flex-1">
              <Phone className="size-4" /> 0973 421 858
            </MVButton>
          </div>
        </div>
      </div>
    </dialog>
  )
}

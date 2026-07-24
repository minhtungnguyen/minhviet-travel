'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { TravelInspirationItem } from '@/types/inspiration'

/**
 * Native `<dialog>` instead of a new modal dependency — `showModal()`
 * gives focus trapping, Escape-to-close and a `::backdrop` for free, so
 * "không cài framework UI mới" is satisfied by using what the platform
 * already provides. The `<video>` element is only ever mounted while
 * this modal is open, so nothing loads before Play is clicked.
 */
export function VideoModal({
  item,
  open,
  onClose,
}: {
  item: TravelInspirationItem
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop lands directly on the <dialog> element itself
        // (its content sits in a child wrapper), so this only fires for
        // genuine backdrop clicks, never for clicks inside the video/text.
        if (e.target === dialogRef.current) onClose()
      }}
      aria-label={`Video: ${item.title}`}
      className="m-auto w-[min(920px,92vw)] rounded-2xl bg-mv-deep-navy p-0 text-white backdrop:bg-mv-deep-navy/70 open:backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 sm:px-6">
        <p className="eyebrow text-[11px] font-semibold text-mv-sky-cyan">{item.category}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng video"
          className="grid size-9 place-items-center rounded-lg text-white/70 transition-colors duration-mv-fast hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {item.videoUrl ? (
          <video
            className="aspect-video w-full rounded-xl bg-black"
            src={item.videoUrl}
            controls
            autoPlay
            poster={item.coverImage.src}
          >
            Trình duyệt của bạn không hỗ trợ phát video này.
          </video>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-8 text-center">
            <p className="font-display text-lg font-bold text-white">
              Video giới thiệu Minh Việt Travel đang được cập nhật.
            </p>
            <p className="text-sm text-white/65">Vui lòng quay lại sau, hoặc khám phá các hành trình đang mở.</p>
          </div>
        )}
      </div>
    </dialog>
  )
}

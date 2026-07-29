'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Mobile-only tap affordance for the card's trust-reveal panel (docs/
 * design/mv-ticket/09-motion-guideline.md: "Hover chỉ Desktop, Mobile dùng
 * Tap" — approved 2026-07-28). Desktop reveals the same panel via pure CSS
 * `group-hover` (no JS needed there); this button only renders where CSS
 * hover isn't available. `stopPropagation`/`preventDefault` so tapping it
 * toggles the reveal instead of following the card's own link.
 */
export function AttractionCardTrustToggle({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      type="button"
      aria-label={open ? 'Ẩn thông tin cam kết' : 'Xem thông tin cam kết'}
      aria-expanded={open}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setOpen((v) => !v)
      }}
      data-trust-open={open ? 'true' : 'false'}
      className={cn(
        'pointer-events-auto grid size-6 place-items-center rounded-full bg-white/90 text-mv-deep-navy [@media(hover:hover)]:hidden',
        className,
      )}
    >
      <Info className="size-3.5" />
    </button>
  )
}

'use client'

import { useState } from 'react'
import { Phone, Copy, Check, RotateCcw } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/**
 * Action Buttons (EPIC-005 §4) — contextual per outcome. "Tra cứu đơn"
 * on the Success page doesn't link anywhere real yet: My Booking
 * (EPIC-006) isn't built. Copying the booking id + a real hotline is
 * the honest stand-in, same pattern as every prior epic's CTA into a
 * not-yet-built next step.
 */
export function FlightPaymentActionButtons({
  variant,
  bookingId,
  retryHref,
}: {
  variant: 'success' | 'failed'
  bookingId: string
  retryHref?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopyBookingId() {
    try {
      await navigator.clipboard.writeText(bookingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can be denied by the browser — the booking id is already visible on screen either way.
    }
  }

  if (variant === 'success') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <MVButton type="button" variant="outline" size="lg" onClick={handleCopyBookingId}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Đã sao chép mã đơn' : 'Tra cứu đơn (sao chép mã đơn)'}
        </MVButton>
        <MVButton href="tel:0934368132" variant="accent" size="lg">
          <Phone className="size-4" />
          0934 368 132
        </MVButton>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {retryHref && (
        <MVButton href={retryHref} variant="accent" size="lg">
          <RotateCcw className="size-4" />
          Thử lại
        </MVButton>
      )}
      <MVButton href="tel:0934368132" variant="outline" size="lg">
        <Phone className="size-4" />
        Liên hệ hỗ trợ
      </MVButton>
    </div>
  )
}

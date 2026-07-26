'use client'

import { useEffect, useState } from 'react'
import { XCircle } from 'lucide-react'
import { loadBookingDraft } from '@/lib/flight/flight-booking-draft'
import { resolveBookingContext } from '@/lib/flight/flight-booking-context'
import { FlightPaymentBookingNotFound } from '@/components/flight/flight-payment-booking-not-found'
import { FlightPaymentBookingSummary } from '@/components/flight/flight-payment-booking-summary'
import { FlightPaymentActionButtons } from '@/components/flight/flight-payment-action-buttons'
import { FlightPaymentLoadingSkeleton } from '@/components/flight/flight-payment-loading-skeleton'
import type { FlightBookingDraft, PaymentStatus } from '@/types/flight'

const REASON_LABELS: Record<string, string> = {
  expired: 'Đã hết thời gian giữ chỗ trước khi nhận được xác nhận thanh toán.',
  failed: 'Giao dịch không thành công — ngân hàng/ví điện tử đã từ chối hoặc bạn đã huỷ giao dịch.',
  declined: 'Giao dịch bị từ chối bởi đơn vị phát hành thẻ.',
}
const DEFAULT_REASON = 'Đã có lỗi xảy ra trong quá trình xử lý thanh toán.'

/**
 * Failed Page (EPIC-005 §4) — `/ve-may-bay/that-bai/[bookingId]`. `reason`
 * also doubles as which mock outcome to display (`expired` vs a
 * declined/failed transaction) — both funnel here per PRD's route list
 * (only 3 routes for 4 logical states). The draft read is deferred to a
 * post-mount effect — see the doc comment on `FlightPaymentView` for why
 * reading `sessionStorage` during render would throw a hydration
 * mismatch.
 */
export function FlightPaymentFailedView({ bookingId, reason }: { bookingId: string; reason?: string }) {
  const [draft, setDraft] = useState<FlightBookingDraft | null | undefined>(undefined)

  useEffect(() => {
    setDraft(loadBookingDraft(bookingId))
  }, [bookingId])

  if (draft === undefined) {
    return <FlightPaymentLoadingSkeleton />
  }

  const context = draft ? resolveBookingContext(draft) : null

  if (!draft || !context) {
    return <FlightPaymentBookingNotFound />
  }

  const { detail, fareOption, priceSummary } = context
  const status: PaymentStatus = reason === 'expired' ? 'expired' : 'failed'
  const reasonLabel = (reason && REASON_LABELS[reason]) || DEFAULT_REASON

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="size-9" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {status === 'expired' ? 'Đã hết thời gian thanh toán' : 'Thanh toán không thành công'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reasonLabel}</p>
      </div>

      <div className="w-full text-left">
        <FlightPaymentBookingSummary
          bookingId={bookingId}
          detail={detail}
          fareOption={fareOption}
          passengers={draft.passengers}
          priceSummary={priceSummary}
        />
      </div>

      <FlightPaymentActionButtons variant="failed" bookingId={bookingId} retryHref={`/ve-may-bay/thanh-toan/${bookingId}`} />
    </div>
  )
}

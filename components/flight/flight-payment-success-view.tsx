'use client'

import { CheckCircle2 } from 'lucide-react'
import { useBookingDraft } from '@/lib/flight/use-booking-draft'
import { resolveBookingContext } from '@/lib/flight/flight-booking-context'
import { FlightPaymentBookingNotFound } from '@/components/flight/flight-payment-booking-not-found'
import { FlightPaymentBookingSummary } from '@/components/flight/flight-payment-booking-summary'
import { FlightPaymentActionButtons } from '@/components/flight/flight-payment-action-buttons'
import { FlightPaymentLoadingSkeleton } from '@/components/flight/flight-payment-loading-skeleton'

/**
 * Success Page (EPIC-005 §4) — `/ve-may-bay/thanh-cong/[bookingId]`. The
 * draft read goes through `useBookingDraft` — see that hook's doc
 * comment for why a hydration-safe read matters here.
 */
export function FlightPaymentSuccessView({ bookingId }: { bookingId: string }) {
  const draft = useBookingDraft(bookingId)

  if (draft === undefined) {
    return <FlightPaymentLoadingSkeleton />
  }

  const context = draft ? resolveBookingContext(draft) : null

  if (!draft || !context) {
    return <FlightPaymentBookingNotFound />
  }

  const { detail, fareOption, priceSummary } = context

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-mv-mist-blue text-mv-journey-blue">
        <CheckCircle2 className="size-9" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Cảm ơn bạn đã đặt vé cùng Minh Việt Travel</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thanh toán đã được ghi nhận. Đội ngũ Minh Việt sẽ liên hệ qua {draft.contact.phone || draft.contact.email} trong vòng 30 phút để xác nhận
          thông tin hành khách và gửi vé điện tử.
        </p>
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

      <FlightPaymentActionButtons variant="success" bookingId={bookingId} />
    </div>
  )
}

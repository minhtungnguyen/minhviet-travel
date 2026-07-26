'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadBookingDraft } from '@/lib/flight/flight-booking-draft'
import { resolveBookingContext } from '@/lib/flight/flight-booking-context'
import { FlightPaymentBookingNotFound } from '@/components/flight/flight-payment-booking-not-found'
import { FlightPaymentBookingSummary } from '@/components/flight/flight-payment-booking-summary'
import { FlightPaymentMethodList } from '@/components/flight/flight-payment-method-list'
import { FlightPaymentQrCard } from '@/components/flight/flight-payment-qr-card'
import { FlightPaymentBankTransferCard } from '@/components/flight/flight-payment-bank-transfer-card'
import { FlightPaymentCardForm } from '@/components/flight/flight-payment-card-form'
import { FlightPaymentPendingPanel } from '@/components/flight/flight-payment-pending-panel'
import { FlightPaymentLoadingSkeleton } from '@/components/flight/flight-payment-loading-skeleton'
import { FlightSupportBox } from '@/components/flight/flight-support-box'
import { MVButton } from '@/components/mv/mv-button'
import type { FlightBookingDraft, PaymentMethod } from '@/types/flight'

const PENDING_WINDOW_MINUTES = 5

/**
 * Payment page (EPIC-005) — `/ve-may-bay/thanh-toan/[bookingId]`. Reads
 * the draft from `sessionStorage` (client-only, see
 * `flight-booking-draft.ts`), re-derives flight/fare/price via
 * `resolveBookingContext`, then walks Method Selection → Pending
 * entirely client-side (no server round-trip, no real gateway).
 *
 * The draft read is deferred to a post-mount effect (rather than a
 * `useState` lazy initializer) so the server render and the first
 * client render both show the loading skeleton — reading
 * `sessionStorage` during render would make that first client render
 * diverge from the server's (which has no `sessionStorage`) and throw
 * a hydration mismatch.
 */
export function FlightPaymentView({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [draft, setDraft] = useState<FlightBookingDraft | null | undefined>(undefined)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

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

  function handleStartWaiting() {
    setExpiresAt(new Date(Date.now() + PENDING_WINDOW_MINUTES * 60 * 1000).toISOString())
  }

  if (expiresAt) {
    return (
      <FlightPaymentPendingPanel
        expiresAt={expiresAt}
        onConfirm={() => router.push(`/ve-may-bay/thanh-cong/${bookingId}`)}
        onSimulateFailure={() => router.push(`/ve-may-bay/that-bai/${bookingId}?reason=failed`)}
        onExpire={() => router.push(`/ve-may-bay/that-bai/${bookingId}?reason=expired`)}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4 lg:order-2">
        <FlightPaymentBookingSummary
          bookingId={bookingId}
          detail={detail}
          fareOption={fareOption}
          passengers={draft.passengers}
          priceSummary={priceSummary}
        />
        <FlightSupportBox />
      </div>

      <div className="flex flex-col gap-4 lg:order-1">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-4 font-display text-base font-bold text-foreground">Chọn phương thức thanh toán</p>
          <FlightPaymentMethodList selected={selectedMethod} onSelect={setSelectedMethod} />
        </div>

        {selectedMethod === 'qr' && <FlightPaymentQrCard bookingId={bookingId} amount={priceSummary.grandTotal} />}
        {selectedMethod === 'bank_transfer' && <FlightPaymentBankTransferCard bookingId={bookingId} amount={priceSummary.grandTotal} />}
        {(selectedMethod === 'domestic_card' || selectedMethod === 'international_card') && (
          <FlightPaymentCardForm variant={selectedMethod === 'domestic_card' ? 'domestic' : 'international'} />
        )}

        {selectedMethod && (
          <MVButton type="button" variant="accent" size="lg" className="w-full" onClick={handleStartWaiting}>
            Tôi đã thanh toán
          </MVButton>
        )}
      </div>
    </div>
  )
}

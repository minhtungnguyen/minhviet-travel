import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightPaymentView } from '@/components/flight/flight-payment-view'

type RouteParams = { bookingId: string }

/**
 * Payment (EPIC-005) — `/ve-may-bay/thanh-toan/[bookingId]`. The booking
 * draft lives in the browser's `sessionStorage` (see
 * `lib/flight/flight-booking-draft.ts`), not on the server, so this page
 * is a thin wrapper around a client view — there is nothing
 * `bookingId`-specific this server component can fetch or render.
 * Never indexed: a transactional page, not content. See
 * docs/PRD/Flight/EPIC-005-Payment-Confirmation.md.
 */
export function generateMetadata(): Metadata {
  return {
    title: 'Thanh toán đặt vé | Minh Việt Travel',
    robots: { index: false, follow: true },
  }
}

export default async function FlightPaymentPage({ params }: { params: Promise<RouteParams> }) {
  const { bookingId } = await params

  return (
    <SiteChrome>
      <div className="container-mv max-w-4xl pt-32 pb-16 sm:pt-40 lg:pt-48">
        <FlightPaymentView bookingId={bookingId} />
      </div>
    </SiteChrome>
  )
}

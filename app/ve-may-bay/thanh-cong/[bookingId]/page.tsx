import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightPaymentSuccessView } from '@/components/flight/flight-payment-success-view'

type RouteParams = { bookingId: string }

/** Success (EPIC-005) — `/ve-may-bay/thanh-cong/[bookingId]`. Same client-only draft read as Payment — see that route's doc comment. */
export function generateMetadata(): Metadata {
  return {
    title: 'Đặt vé thành công | Minh Việt Travel',
    robots: { index: false, follow: true },
  }
}

export default async function FlightPaymentSuccessPage({ params }: { params: Promise<RouteParams> }) {
  const { bookingId } = await params

  return (
    <SiteChrome>
      <div className="container-mv max-w-4xl pt-32 pb-16 sm:pt-40 lg:pt-48">
        <FlightPaymentSuccessView bookingId={bookingId} />
      </div>
    </SiteChrome>
  )
}

import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightPaymentFailedView } from '@/components/flight/flight-payment-failed-view'

type RouteParams = { bookingId: string }
type RouteSearchParams = Record<string, string | string[] | undefined>

function readReason(searchParams: RouteSearchParams): string | undefined {
  const value = searchParams.reason
  return Array.isArray(value) ? value[0] : value
}

/** Failed (EPIC-005) — `/ve-may-bay/that-bai/[bookingId]`. Same client-only draft read as Payment — see that route's doc comment. `?reason=` distinguishes an expired hold from a declined/failed transaction (both funnel to this one route, per PRD's 3-route list for 4 logical states). */
export function generateMetadata(): Metadata {
  return {
    title: 'Thanh toán không thành công | Minh Việt Travel',
    robots: { index: false, follow: true },
  }
}

export default async function FlightPaymentFailedPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<RouteSearchParams>
}) {
  const { bookingId } = await params
  const reason = readReason(await searchParams)

  return (
    <SiteChrome>
      <div className="container-mv max-w-4xl pt-32 pb-16 sm:pt-40 lg:pt-48">
        <FlightPaymentFailedView bookingId={bookingId} reason={reason} />
      </div>
    </SiteChrome>
  )
}

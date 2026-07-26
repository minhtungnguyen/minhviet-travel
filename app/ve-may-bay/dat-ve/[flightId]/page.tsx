import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightBookingView } from '@/components/flight/flight-booking-view'
import { FlightDetailNotFound } from '@/components/flight/flight-detail-not-found'
import { FlightDetailFareEmptyState } from '@/components/flight/flight-detail-fare-empty-state'
import { getFlightDetail } from '@/lib/flight/flight-detail-repository'
import { parseFlightDetailUrlContext, buildFlightDetailPath } from '@/lib/flight/flight-detail-id'

type RouteParams = { flightId: string }
type RouteSearchParams = Record<string, string | string[] | undefined>

function readFareOptionId(searchParams: RouteSearchParams): string | undefined {
  const value = searchParams.fareOptionId
  return Array.isArray(value) ? value[0] : value
}

/**
 * Booking Flow (EPIC-004) — `/ve-may-bay/dat-ve/[flightId]`. Same
 * flightId + `?cabinClass=&adults=&children=&infants=` context as Flight
 * Detail (EPIC-003), plus `?fareOptionId=` for which tier was picked
 * there. Mock Data only — no passenger data is persisted, no real
 * booking/payment. Never indexed: this is a data-entry page, not
 * content. See docs/PRD/Flight/EPIC-004-Booking-Flow.md.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { flightId } = await params
  return {
    title: `Đặt vé chuyến bay | Minh Việt Travel`,
    description: 'Nhập thông tin liên hệ, hành khách và dịch vụ bổ sung để hoàn tất yêu cầu đặt vé.',
    robots: { index: false, follow: true },
    alternates: { canonical: `/ve-may-bay/dat-ve/${flightId}` },
  }
}

export default async function FlightBookingPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<RouteSearchParams>
}) {
  const { flightId } = await params
  const resolvedSearchParams = await searchParams
  const context = parseFlightDetailUrlContext(resolvedSearchParams)
  const detail = await getFlightDetail(flightId, context)

  if (!detail) {
    return (
      <SiteChrome>
        <div className="container-mv pt-32 pb-16 sm:pt-40 lg:pt-48">
          <FlightDetailNotFound backHref="/ve-may-bay" />
        </div>
      </SiteChrome>
    )
  }

  const fareOptionId = readFareOptionId(resolvedSearchParams)
  const selectedFareOption =
    detail.fareOptions.find((option) => option.id === fareOptionId) ??
    detail.fareOptions.find((option) => option.id === detail.defaultFareOptionId) ??
    detail.fareOptions[0]

  if (!selectedFareOption) {
    return (
      <SiteChrome>
        <div className="container-mv pt-32 pb-16 sm:pt-40 lg:pt-48">
          <FlightDetailFareEmptyState />
        </div>
      </SiteChrome>
    )
  }

  const backHref = buildFlightDetailPath(flightId, context)

  return (
    <SiteChrome>
      <div className="container-mv pt-32 sm:pt-40 lg:pt-48">
        <FlightBookingView detail={detail} fareOption={selectedFareOption} backHref={backHref} />
      </div>
    </SiteChrome>
  )
}

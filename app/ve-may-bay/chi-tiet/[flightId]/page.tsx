import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightDetailView } from '@/components/flight/flight-detail-view'
import { FlightDetailJsonLd } from '@/components/seo/json-ld'
import { FlightDetailNotFound } from '@/components/flight/flight-detail-not-found'
import { getFlightDetail, type FlightDetailContext } from '@/lib/flight/flight-detail-repository'
import { buildFlightSearchUrl } from '@/lib/flight/flight-search-url'
import { SITE_URL } from '@/constants/seo'
import type { FlightCabinClass } from '@/types/flight'

type RouteParams = { flightId: string }
type RouteSearchParams = Record<string, string | string[] | undefined>

const CABIN_CLASSES: FlightCabinClass[] = ['economy', 'premium_economy', 'business', 'first']

function readParam(searchParams: RouteSearchParams, key: string): string | undefined {
  const value = searchParams[key]
  return Array.isArray(value) ? value[0] : value
}

function parseCount(value: string | undefined, fallback: number, max: number): number {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) return fallback
  return Math.min(parsed, max)
}

/**
 * `?cabinClass=&adults=&children=&infants=` — the context `FlightOffer.id`
 * doesn't encode but the seeded generator needs to regenerate the exact
 * offer the user saw on Search Results (see `flight-detail-id.ts`).
 * Defensive like `parseFlightSearchQueryParams`: never throws, always
 * returns a usable context.
 */
function parseDetailContext(searchParams: RouteSearchParams): FlightDetailContext {
  const cabinClassRaw = readParam(searchParams, 'cabinClass')
  const cabinClass = CABIN_CLASSES.includes(cabinClassRaw as FlightCabinClass) ? (cabinClassRaw as FlightCabinClass) : 'economy'

  return {
    cabinClass,
    adults: Math.max(1, parseCount(readParam(searchParams, 'adults'), 1, 9)),
    children: parseCount(readParam(searchParams, 'children'), 0, 8),
    infants: parseCount(readParam(searchParams, 'infants'), 0, 8),
  }
}

/**
 * Flight Detail (EPIC-003) — `/ve-may-bay/chi-tiet/[flightId]`. Distinct
 * from `/ve-may-bay/tim-kiem` (Search Results) and the reserved
 * `/ve-may-bay/{from}/{to}` SEO Landing route (EPIC-008, untouched).
 * Mock Data only, no flight-provider API, no real booking — see
 * docs/PRD/Flight/EPIC-003-Flight-Detail.md.
 */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<RouteSearchParams>
}): Promise<Metadata> {
  const { flightId } = await params
  const detail = await getFlightDetail(flightId, parseDetailContext(await searchParams))
  const canonicalPath = `/ve-may-bay/chi-tiet/${flightId}`

  if (!detail) {
    return { title: 'Không tìm thấy chuyến bay | Minh Việt Travel', robots: { index: false, follow: true } }
  }

  const title = `Chi tiết chuyến bay ${detail.origin.city} đi ${detail.destination.city} – Minh Việt Travel`
  const description = `Xem giờ bay, giá vé, hành lý và điều kiện vé cho chuyến bay ${detail.origin.city} đi ${detail.destination.city} cùng Minh Việt Travel.`

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { title, description, url: `${SITE_URL}${canonicalPath}`, locale: 'vi_VN', type: 'website' },
  }
}

export default async function FlightDetailPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<RouteSearchParams>
}) {
  const { flightId } = await params
  const detail = await getFlightDetail(flightId, parseDetailContext(await searchParams))

  if (!detail) {
    return (
      <SiteChrome>
        <div className="container-mv pt-32 pb-16 sm:pt-40 lg:pt-48">
          <FlightDetailNotFound backHref="/ve-may-bay" />
        </div>
      </SiteChrome>
    )
  }

  const backHref = buildFlightSearchUrl(detail.query)
  const pageUrl = `${SITE_URL}/ve-may-bay/chi-tiet/${flightId}`

  return (
    <SiteChrome>
      <FlightDetailJsonLd detail={detail} pageUrl={pageUrl} />
      <div className="container-mv pt-32 sm:pt-40 lg:pt-48">
        <FlightDetailView detail={detail} backHref={backHref} />
      </div>
    </SiteChrome>
  )
}

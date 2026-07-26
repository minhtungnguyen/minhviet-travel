import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightSearchSummary } from '@/components/flight/flight-search-summary'
import { FlightSearchResults } from '@/components/flight/flight-search-results'
import { FlightSearchResultsJsonLd } from '@/components/seo/json-ld'
import { getFlightSearchResults } from '@/lib/flight/flight-search-repository'
import { getFlightHomeContent } from '@/lib/flight/flight-repository'
import { findFlightAirportByCode } from '@/lib/flight/flight-data-seed'
import { parseFlightSearchQueryParams, buildFlightSearchQueryString, FLIGHT_SEARCH_PATH } from '@/lib/flight/flight-search-url'
import { SITE_URL } from '@/constants/seo'

type RouteSearchParams = Record<string, string | string[] | undefined>

/**
 * Search Results (EPIC-002) — `/ve-may-bay/tim-kiem`, driven entirely by
 * query params. Deliberately NOT `/ve-may-bay/{from}/{to}`: that
 * path-segment shape is reserved for the future SEO Landing Engine
 * (EPIC-008), see docs/Handover/Flight/EPIC-002-HANDOVER.md's
 * Architecture Update. Distinct from `/ve-may-bay` (EPIC-001 Homepage)
 * and `/flights` (existing B2B module, untouched). Mock Data only, no
 * flight-provider API — see docs/PRD/Flight/EPIC-002-Flight-Search-Results.md.
 *
 * Query params never 404 the page — `parseFlightSearchQueryParams`
 * defaults anything missing/malformed (including an unknown airport
 * code) rather than treating a search URL like a canonical resource URL.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>
}): Promise<Metadata> {
  const query = parseFlightSearchQueryParams(await searchParams)
  const origin = findFlightAirportByCode(query.originCode)
  const destination = findFlightAirportByCode(query.destinationCode)

  const title = origin && destination
    ? `Kết quả tìm kiếm: ${origin.city} → ${destination.city} | Minh Việt Travel`
    : 'Kết quả tìm kiếm chuyến bay | Minh Việt Travel'
  const description =
    'So sánh giá vé máy bay theo hãng bay, giờ bay và giá — lọc và sắp xếp kết quả tìm kiếm cùng Minh Việt Travel.'

  return {
    title,
    description,
    // Search Results is a utility/action page, not indexable content —
    // canonical, indexable landing pages for each route live at the
    // reserved `/ve-may-bay/{from}/{to}` SEO Landing route instead (EPIC-008).
    robots: { index: false, follow: true },
    openGraph: { title, description, url: `${SITE_URL}${FLIGHT_SEARCH_PATH}`, locale: 'vi_VN', type: 'website' },
  }
}

export default async function FlightSearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>
}) {
  const query = parseFlightSearchQueryParams(await searchParams)

  const [results, homeContent] = await Promise.all([getFlightSearchResults(query), getFlightHomeContent()])
  const currentUrl = `${SITE_URL}${FLIGHT_SEARCH_PATH}?${buildFlightSearchQueryString(query)}`

  return (
    <SiteChrome>
      <FlightSearchResultsJsonLd
        origin={results.origin}
        destination={results.destination}
        resultCount={results.offers.length}
        pageUrl={currentUrl}
      />
      <FlightSearchSummary
        origin={results.origin}
        destination={results.destination}
        query={query}
        airports={homeContent.searchBox.airports}
        cabinClasses={homeContent.searchBox.cabinClasses}
      />
      <FlightSearchResults results={results} />
    </SiteChrome>
  )
}

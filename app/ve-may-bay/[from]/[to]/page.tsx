import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightSearchSummary } from '@/components/flight/flight-search-summary'
import { FlightSearchResults } from '@/components/flight/flight-search-results'
import { FlightSearchResultsJsonLd } from '@/components/seo/json-ld'
import { getFlightSearchResults } from '@/lib/flight/flight-search-repository'
import { getFlightHomeContent } from '@/lib/flight/flight-repository'
import { findFlightAirportBySlug } from '@/lib/flight/flight-data-seed'
import { parseFlightSearchQueryParams } from '@/lib/flight/flight-search-url'
import { SITE_URL } from '@/constants/seo'
import type { FlightSearchQuery } from '@/types/flight'

type RouteParams = { from: string; to: string }
type RouteSearchParams = Record<string, string | string[] | undefined>

async function resolveRoute(params: Promise<RouteParams>, searchParams: Promise<RouteSearchParams>) {
  const { from, to } = await params
  const origin = findFlightAirportBySlug(from)
  const destination = findFlightAirportBySlug(to)
  if (!origin || !destination || origin.code === destination.code) return null

  const urlQuery = parseFlightSearchQueryParams(await searchParams)
  const query: FlightSearchQuery = { ...urlQuery, originCode: origin.code, destinationCode: destination.code }

  return { origin, destination, query }
}

/**
 * Search Results (EPIC-002) — `/ve-may-bay/{originSlug}/{destinationSlug}`.
 * Distinct from `/ve-may-bay` (EPIC-001 Homepage) and `/flights` (existing
 * B2B module, untouched). Mock Data only, no flight-provider API — see
 * docs/PRD/Flight/EPIC-002-Flight-Search-Results.md.
 */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<RouteSearchParams>
}): Promise<Metadata> {
  const resolved = await resolveRoute(params, searchParams)
  if (!resolved) return { title: 'Không tìm thấy chặng bay | Minh Việt Travel' }

  const { origin, destination, query } = resolved
  const title = `Vé máy bay ${origin.city} đi ${destination.city} giá tốt | Minh Việt Travel`
  const description = `So sánh giá vé máy bay ${origin.city} (${origin.code}) – ${destination.city} (${destination.code}) ngày ${query.departDate}. Lọc theo hãng bay, giờ bay, giá vé — đặt vé nhanh cùng Minh Việt Travel.`
  const canonicalPath = `/ve-may-bay/${origin.slug}/${destination.slug}`

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: { card: 'summary', title, description },
  }
}

export default async function FlightSearchResultsPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<RouteSearchParams>
}) {
  const resolved = await resolveRoute(params, searchParams)
  if (!resolved) notFound()

  const { origin, destination, query } = resolved
  const [results, homeContent] = await Promise.all([getFlightSearchResults(query), getFlightHomeContent()])

  return (
    <SiteChrome>
      <FlightSearchResultsJsonLd origin={origin} destination={destination} query={query} resultCount={results.offers.length} />
      <FlightSearchSummary
        origin={origin}
        destination={destination}
        query={query}
        airports={homeContent.searchBox.airports}
        cabinClasses={homeContent.searchBox.cabinClasses}
      />
      <FlightSearchResults results={results} />
    </SiteChrome>
  )
}

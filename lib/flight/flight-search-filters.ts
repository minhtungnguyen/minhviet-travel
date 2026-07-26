import type { FlightOffer } from '@/types/flight'

/**
 * Pure filter/sort logic for Search Results (EPIC-002 §3 Filter Sidebar /
 * Sort). Kept separate from `flight-search-results.tsx` so it's unit-testable
 * without rendering, mirroring `lib/tours/availability.ts`'s split between
 * business logic and presentation.
 */

export type FlightTimeBucket = 'early' | 'morning' | 'afternoon' | 'evening'
export type FlightStopsFilter = 'any' | 'direct' | 'max1'
export type FlightSortKey = 'recommended' | 'price' | 'departure' | 'duration'

export const TIME_BUCKET_LABELS: Record<FlightTimeBucket, string> = {
  early: 'Sáng sớm (00:00 – 06:00)',
  morning: 'Buổi sáng (06:00 – 12:00)',
  afternoon: 'Buổi chiều (12:00 – 18:00)',
  evening: 'Buổi tối (18:00 – 24:00)',
}

export const SORT_LABELS: Record<FlightSortKey, string> = {
  recommended: 'Khuyến nghị',
  price: 'Giá thấp nhất',
  departure: 'Cất cánh sớm nhất',
  duration: 'Bay nhanh nhất',
}

export interface FlightResultFilters {
  maxPrice: number | null
  airlineCodes: string[]
  departBuckets: FlightTimeBucket[]
  arriveBuckets: FlightTimeBucket[]
  stops: FlightStopsFilter
}

export const EMPTY_FLIGHT_FILTERS: FlightResultFilters = {
  maxPrice: null,
  airlineCodes: [],
  departBuckets: [],
  arriveBuckets: [],
  stops: 'any',
}

export function getTimeBucket(iso: string): FlightTimeBucket {
  const hour = new Date(iso).getUTCHours()
  if (hour < 6) return 'early'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export function filterFlightOffers(offers: FlightOffer[], filters: FlightResultFilters): FlightOffer[] {
  return offers.filter((offer) => {
    if (filters.maxPrice !== null && offer.price > filters.maxPrice) return false
    if (filters.airlineCodes.length > 0 && !filters.airlineCodes.includes(offer.airlineCode)) return false
    if (filters.departBuckets.length > 0 && !filters.departBuckets.includes(getTimeBucket(offer.departTime))) return false
    if (filters.arriveBuckets.length > 0 && !filters.arriveBuckets.includes(getTimeBucket(offer.arriveTime))) return false
    if (filters.stops === 'direct' && offer.stops !== 0) return false
    if (filters.stops === 'max1' && offer.stops > 1) return false
    return true
  })
}

export function sortFlightOffers(offers: FlightOffer[], sortKey: FlightSortKey): FlightOffer[] {
  const sorted = [...offers]
  switch (sortKey) {
    case 'price':
      return sorted.sort((a, b) => a.price - b.price)
    case 'departure':
      return sorted.sort((a, b) => a.departTime.localeCompare(b.departTime))
    case 'duration':
      return sorted.sort((a, b) => a.durationMinutes - b.durationMinutes)
    case 'recommended':
    default:
      return sorted.sort((a, b) => Number(b.isRecommended) - Number(a.isRecommended) || a.price - b.price)
  }
}

'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { FlightFareCalendar } from '@/components/flight/flight-fare-calendar'
import { FlightSortBar } from '@/components/flight/flight-sort-bar'
import { FlightFilterSidebar } from '@/components/flight/flight-filter-sidebar'
import { FlightList } from '@/components/flight/flight-list'
import { FlightPagination } from '@/components/flight/flight-pagination'
import { FlightEmptyState } from '@/components/flight/flight-empty-state'
import { MVButton } from '@/components/mv/mv-button'
import { buildFlightSearchUrl } from '@/lib/flight/flight-search-url'
import {
  EMPTY_FLIGHT_FILTERS,
  filterFlightOffers,
  sortFlightOffers,
  type FlightResultFilters,
  type FlightSortKey,
} from '@/lib/flight/flight-search-filters'
import type { FlightAirlineFilterOption } from '@/components/flight/flight-airline-filter'
import type { FlightSearchResults as FlightSearchResultsData } from '@/types/flight'

const CABIN_LABELS: Record<string, string> = {
  economy: 'Phổ thông',
  premium_economy: 'Phổ thông đặc biệt',
  business: 'Thương gia',
  first: 'Hạng nhất',
}

const PAGE_SIZE = 6

export function FlightSearchResults({ results }: { results: FlightSearchResultsData }) {
  const router = useRouter()
  const [filters, setFilters] = useState<FlightResultFilters>(EMPTY_FLIGHT_FILTERS)
  const [sortKey, setSortKey] = useState<FlightSortKey>('recommended')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Reset "Load More" progress when filters/sort change — adjusted during
  // render (not an effect) per https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const filterResetKey = `${sortKey}:${JSON.stringify(filters)}`
  const [lastFilterResetKey, setLastFilterResetKey] = useState(filterResetKey)
  if (filterResetKey !== lastFilterResetKey) {
    setLastFilterResetKey(filterResetKey)
    setVisibleCount(PAGE_SIZE)
  }

  const priceBounds = useMemo(() => {
    const prices = results.offers.map((offer) => offer.price)
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 0) }
  }, [results.offers])

  const airlineOptions = useMemo<FlightAirlineFilterOption[]>(() => {
    const counts = new Map<string, FlightAirlineFilterOption>()
    for (const offer of results.offers) {
      const existing = counts.get(offer.airlineCode)
      if (existing) existing.count += 1
      else counts.set(offer.airlineCode, { code: offer.airlineCode, name: offer.airlineName, count: 1 })
    }
    return Array.from(counts.values())
  }, [results.offers])

  const filteredOffers = useMemo(() => filterFlightOffers(results.offers, filters), [results.offers, filters])
  const sortedOffers = useMemo(() => sortFlightOffers(filteredOffers, sortKey), [filteredOffers, sortKey])
  const visibleOffers = sortedOffers.slice(0, visibleCount)

  function handleSelectDate(date: string) {
    router.push(buildFlightSearchUrl({ ...results.query, departDate: date }))
  }

  const sidebarProps = {
    filters,
    onChange: setFilters,
    priceBounds,
    airlineOptions,
    cabinClassLabel: CABIN_LABELS[results.query.cabinClass],
  }

  return (
    <div className="pb-16">
      <FlightFareCalendar days={results.fareCalendar} onSelectDate={handleSelectDate} />

      <div className="container-mv">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
              <FlightFilterSidebar {...sidebarProps} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
              <MVButton type="button" variant="outline" size="sm" onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal className="size-4" />
                Bộ lọc
              </MVButton>
            </div>

            <FlightSortBar value={sortKey} onChange={setSortKey} resultCount={sortedOffers.length} />

            <div className="mt-4">
              {sortedOffers.length === 0 ? (
                <FlightEmptyState onResetFilters={() => setFilters(EMPTY_FLIGHT_FILTERS)} />
              ) : (
                <>
                  <FlightList offers={visibleOffers} query={results.query} />
                  <FlightPagination total={sortedOffers.length} visible={visibleOffers.length} onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng bộ lọc"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-mv-deep-navy/60"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-5 shadow-soft-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-base font-bold text-foreground">Bộ lọc chuyến bay</p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Đóng"
                className="grid size-9 place-items-center rounded-full text-foreground hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>
            <FlightFilterSidebar {...sidebarProps} />
            <MVButton type="button" variant="accent" size="lg" className="mt-6 w-full" onClick={() => setMobileFiltersOpen(false)}>
              Xem {filterFlightOffers(results.offers, filters).length} chuyến bay
            </MVButton>
          </div>
        </div>
      )}
    </div>
  )
}

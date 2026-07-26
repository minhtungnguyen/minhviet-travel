'use client'

import { useState } from 'react'
import { PlaneTakeoff, PlaneLanding, CalendarDays, Users, SlidersHorizontal, X } from 'lucide-react'
import { FlightSearchBox } from '@/components/flight/flight-search-box'
import { MVButton } from '@/components/mv/mv-button'
import { cn } from '@/lib/utils'
import type { FlightAirport, FlightCabinClassOption, FlightSearchQuery } from '@/types/flight'

const CABIN_LABELS: Record<string, string> = {
  economy: 'Phổ thông',
  premium_economy: 'Phổ thông đặc biệt',
  business: 'Thương gia',
  first: 'Hạng nhất',
}

/** Compact "Search Summary" bar (EPIC-002 §3) with a "Sửa tìm kiếm" toggle that reveals the full, prefilled `FlightSearchBox` — reusing it rather than building a second search form. */
export function FlightSearchSummary({
  origin,
  destination,
  query,
  airports,
  cabinClasses,
}: {
  origin: FlightAirport
  destination: FlightAirport
  query: FlightSearchQuery
  airports: FlightAirport[]
  cabinClasses: FlightCabinClassOption[]
}) {
  const [editing, setEditing] = useState(false)
  const totalPassengers = query.adults + query.children + query.infants
  const departLabel = new Date(query.departDate).toLocaleDateString('vi-VN')
  const returnLabel = query.returnDate ? ` – ${new Date(query.returnDate).toLocaleDateString('vi-VN')}` : ''

  return (
    // pt-32/sm:pt-40/lg:pt-48 clears `SiteHeader`'s `fixed` header — same
    // offset `FlightHero` uses, since this bar (not a hero) is the first
    // section on the Search Results route.
    <div className="border-b border-border bg-card pt-32 sm:pt-40 lg:pt-48">
      <div className="container-mv flex flex-wrap items-center gap-x-6 gap-y-3 py-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <PlaneTakeoff className="size-4 shrink-0 text-mv-journey-blue" />
            {origin.city} ({origin.code})
            <span aria-hidden className="text-muted-foreground">
              →
            </span>
            <PlaneLanding className="size-4 shrink-0 text-mv-journey-blue" aria-hidden />
            {destination.city} ({destination.code})
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-4 shrink-0 text-mv-journey-blue" />
            {departLabel}
            {returnLabel}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-4 shrink-0 text-mv-journey-blue" />
            {totalPassengers} khách · {CABIN_LABELS[query.cabinClass]}
          </span>
        </div>

        <MVButton type="button" variant="outline" size="sm" onClick={() => setEditing((current) => !current)}>
          {editing ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
          {editing ? 'Đóng' : 'Sửa tìm kiếm'}
        </MVButton>
      </div>

      {editing && (
        <div className={cn('container-mv pb-5')}>
          <FlightSearchBox
            airports={airports}
            cabinClasses={cabinClasses}
            defaultOriginCode={origin.code}
            defaultDestinationCode={destination.code}
            initialValues={{
              tripType: query.tripType,
              originCode: query.originCode,
              destinationCode: query.destinationCode,
              departDate: query.departDate,
              returnDate: query.returnDate,
              passengers: { adults: query.adults, children: query.children, infants: query.infants },
              cabinClass: query.cabinClass,
            }}
          />
        </div>
      )}
    </div>
  )
}

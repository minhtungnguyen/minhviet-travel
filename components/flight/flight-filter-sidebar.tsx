import { FlightPriceFilter } from '@/components/flight/flight-price-filter'
import { FlightAirlineFilter, type FlightAirlineFilterOption } from '@/components/flight/flight-airline-filter'
import { FlightTimeFilter } from '@/components/flight/flight-time-filter'
import { MVButton } from '@/components/mv/mv-button'
import { cn } from '@/lib/utils'
import { EMPTY_FLIGHT_FILTERS, type FlightResultFilters, type FlightStopsFilter } from '@/lib/flight/flight-search-filters'

const STOPS_OPTIONS: { value: FlightStopsFilter; label: string }[] = [
  { value: 'any', label: 'Tất cả' },
  { value: 'direct', label: 'Bay thẳng' },
  { value: 'max1', label: 'Tối đa 1 điểm dừng' },
]

/**
 * Filter Sidebar content (EPIC-002 §3/§4). "Bay thẳng"/"Số điểm dừng" and
 * "Hạng ghế" aren't named as their own components in the PRD's component
 * list (§4) — they live here as inline sections instead of one-off files,
 * while Price/Airline/Time — which the PRD does name — are separate,
 * reusable components.
 */
export function FlightFilterSidebar({
  filters,
  onChange,
  priceBounds,
  airlineOptions,
  cabinClassLabel,
  className,
}: {
  filters: FlightResultFilters
  onChange: (next: FlightResultFilters) => void
  priceBounds: { min: number; max: number }
  airlineOptions: FlightAirlineFilterOption[]
  cabinClassLabel: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-bold text-foreground">Bộ lọc</p>
        <MVButton type="button" variant="ghost" size="sm" onClick={() => onChange(EMPTY_FLIGHT_FILTERS)}>
          Đặt lại
        </MVButton>
      </div>

      <FlightPriceFilter
        min={priceBounds.min}
        max={priceBounds.max}
        value={filters.maxPrice ?? priceBounds.max}
        onChange={(maxPrice) => onChange({ ...filters, maxPrice })}
      />

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Hạng ghế</p>
        <p className="text-sm text-muted-foreground">{cabinClassLabel} (theo tìm kiếm hiện tại)</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Số điểm dừng</p>
        <div className="flex flex-col gap-2">
          {STOPS_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="flight-stops-filter"
                checked={filters.stops === option.value}
                onChange={() => onChange({ ...filters, stops: option.value })}
                className="size-4 accent-mv-journey-blue"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {airlineOptions.length > 1 && (
        <FlightAirlineFilter
          options={airlineOptions}
          selected={filters.airlineCodes}
          onChange={(airlineCodes) => onChange({ ...filters, airlineCodes })}
        />
      )}

      <FlightTimeFilter
        label="Giờ cất cánh"
        selected={filters.departBuckets}
        onChange={(departBuckets) => onChange({ ...filters, departBuckets })}
      />
      <FlightTimeFilter
        label="Giờ hạ cánh"
        selected={filters.arriveBuckets}
        onChange={(arriveBuckets) => onChange({ ...filters, arriveBuckets })}
      />
    </div>
  )
}

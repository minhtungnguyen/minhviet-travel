import { Info } from 'lucide-react'
import { FlightPriceBreakdownList } from '@/components/flight/flight-price-breakdown'
import { formatVnd } from '@/lib/flight/flight-format'
import type { FlightPriceBreakdown } from '@/types/flight'

const CABIN_PASSENGER_LABEL = (count: { adults: number; children: number; infants: number }) => {
  const parts: string[] = []
  if (count.adults > 0) parts.push(`${count.adults} người lớn`)
  if (count.children > 0) parts.push(`${count.children} trẻ em`)
  if (count.infants > 0) parts.push(`${count.infants} em bé`)
  return parts.join(' · ')
}

/** Price Summary sidebar (EPIC-003 §4.6) — wraps `FlightPriceBreakdownList` with the party-size total and the mandatory mock-data disclaimer. */
export function FlightPriceSummary({ breakdown, disclaimer }: { breakdown: FlightPriceBreakdown; disclaimer: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-3 font-display text-base font-bold text-foreground">Chi tiết giá</p>
      <FlightPriceBreakdownList breakdown={breakdown} />

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">{CABIN_PASSENGER_LABEL(breakdown.passengerCount)}</p>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="text-sm font-semibold text-foreground">Tổng cộng</p>
          <p className="font-display text-2xl font-extrabold text-mv-journey-blue">{formatVnd(breakdown.totalForParty)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        {disclaimer}
      </div>
    </div>
  )
}

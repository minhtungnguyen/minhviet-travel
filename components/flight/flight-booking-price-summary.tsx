import { FlightPriceBreakdownList } from '@/components/flight/flight-price-breakdown'
import { formatVnd } from '@/lib/flight/flight-format'
import type { FlightBookingPriceSummary } from '@/types/flight'

/** Price Summary (EPIC-004 §4) — the selected fare's breakdown (reused from EPIC-003) plus a line per selected extra service. */
export function FlightBookingPriceSummarySection({ summary }: { summary: FlightBookingPriceSummary }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-3 font-display text-base font-bold text-foreground">Tổng tiền tạm tính</p>
      <FlightPriceBreakdownList breakdown={summary.fareBreakdown} />

      {summary.selectedExtraServices.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-sm">
          {summary.selectedExtraServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <dt className="text-muted-foreground">{service.name}</dt>
              <dd className="font-medium text-foreground">+{formatVnd(service.price)}</dd>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">Tổng cộng tạm tính</p>
        <p className="font-display text-2xl font-extrabold text-mv-journey-blue">{formatVnd(summary.grandTotal)}</p>
      </div>
    </div>
  )
}

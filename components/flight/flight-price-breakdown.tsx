import { formatVnd } from '@/lib/flight/flight-format'
import type { FlightPriceBreakdown } from '@/types/flight'

/** Itemized fare breakdown, per passenger (EPIC-003 §4.6). */
export function FlightPriceBreakdownList({ breakdown }: { breakdown: FlightPriceBreakdown }) {
  const rows: { label: string; value: number }[] = [
    { label: 'Giá cơ bản', value: breakdown.baseFarePerPax },
    { label: 'Thuế', value: breakdown.taxesPerPax },
    { label: 'Phí sân bay', value: breakdown.airportFeePerPax },
    { label: 'Phí dịch vụ', value: breakdown.serviceFeePerPax },
  ]
  if (breakdown.surchargePerPax > 0) rows.push({ label: 'Phụ thu', value: breakdown.surchargePerPax })

  return (
    <dl className="flex flex-col gap-2 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="font-medium text-foreground">{formatVnd(row.value)}</dd>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <dt className="text-muted-foreground">Giá / khách</dt>
        <dd className="font-semibold text-foreground">{formatVnd(breakdown.totalPerPax)}</dd>
      </div>
    </dl>
  )
}

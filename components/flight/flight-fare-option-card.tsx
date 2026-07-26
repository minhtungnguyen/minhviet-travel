import { Check, Luggage, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MVButton } from '@/components/mv/mv-button'
import { formatVnd } from '@/lib/flight/flight-format'
import { cn } from '@/lib/utils'
import type { FareOption } from '@/types/flight'

function FeatureRow({ included, label }: { included: boolean; label: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-sm', included ? 'text-foreground' : 'text-muted-foreground line-through')}>
      {included ? <Check className="size-4 shrink-0 text-success" /> : <X className="size-4 shrink-0" />}
      {label}
    </div>
  )
}

/** One fare tier's full detail (EPIC-003 §4.3) — rendered below `FlightFareOptionTabs` for whichever tier is currently selected. */
export function FlightFareOptionCard({
  fareOption,
  selected,
  onSelect,
}: {
  fareOption: FareOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-5 transition-colors',
        selected ? 'border-mv-journey-blue bg-mv-mist-blue/40' : 'border-border bg-card',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-bold text-foreground">{fareOption.name}</p>
            {fareOption.isRecommended && <Badge variant="accent">Khuyến nghị</Badge>}
          </div>
          <p className="mt-1 font-display text-2xl font-extrabold text-mv-journey-blue">{formatVnd(fareOption.totalPrice)}</p>
          <p className="text-xs text-muted-foreground">Giá / khách, đã gồm thuế và phí</p>
        </div>
        <MVButton type="button" variant={selected ? 'secondary' : 'accent'} size="md" onClick={onSelect}>
          {selected ? 'Đã chọn' : 'Chọn gói này'}
        </MVButton>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-border pt-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Luggage className="size-4 shrink-0 text-mv-journey-blue" />
          Xách tay {fareOption.baggage.carryOnKg}kg · Ký gửi {fareOption.baggage.checkedKg > 0 ? `${fareOption.baggage.checkedKg}kg` : 'không bao gồm'}
        </div>
        <FeatureRow included={fareOption.mealIncluded} label="Suất ăn" />
        <FeatureRow included={fareOption.seatSelectionIncluded} label="Chọn chỗ ngồi" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
        <p>{fareOption.changePolicy}{fareOption.changeFee !== null && fareOption.changeFee > 0 ? ` (${formatVnd(fareOption.changeFee)})` : ''}</p>
        <p>{fareOption.refundPolicy}{fareOption.refundFee !== null && fareOption.refundFee > 0 ? ` (${formatVnd(fareOption.refundFee)})` : ''}</p>
      </div>
    </div>
  )
}

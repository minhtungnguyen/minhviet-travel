import { Plane } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import type { FlightAirport } from '@/types/flight'

export function FlightPopularRouteCard({
  origin,
  destination,
  priceFrom,
  currency,
  popularAirlines,
  href,
}: {
  origin: FlightAirport
  destination: FlightAirport
  priceFrom: number
  currency: string
  popularAirlines: string[]
  href: string
}) {
  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-mv-normal hover:-translate-y-1 hover:border-mv-journey-blue/40 hover:shadow-soft-lg">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{origin.city}</p>
            <p className="font-display text-lg font-bold text-foreground">{origin.code}</p>
          </div>
          <div className="flex flex-1 items-center justify-center gap-1.5 text-mv-journey-blue">
            <span className="h-px flex-1 bg-mv-journey-blue/25" />
            <Plane className="size-4 shrink-0 rotate-90" aria-hidden />
            <span className="h-px flex-1 bg-mv-journey-blue/25" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{destination.city}</p>
            <p className="font-display text-lg font-bold text-foreground">{destination.code}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Hãng phổ biến: <span className="font-medium text-foreground">{popularAirlines.join(', ')}</span>
        </p>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
        <div>
          <p className="eyebrow text-[10px] text-muted-foreground">Giá từ</p>
          <p className="text-lg font-extrabold text-mv-journey-blue">
            {priceFrom.toLocaleString('vi-VN')} {currency}
          </p>
        </div>
        <MVButton href={href} variant="outline" size="sm">
          Xem chuyến bay
        </MVButton>
      </div>
    </article>
  )
}

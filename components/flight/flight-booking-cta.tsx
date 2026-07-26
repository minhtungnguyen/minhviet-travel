import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { buildFlightBookingPath } from '@/lib/flight/flight-detail-id'
import type { FlightSearchQuery } from '@/types/flight'

/**
 * Booking CTA (EPIC-003 §4.7). "Tiếp tục đặt vé" now links to the real
 * Booking Flow (EPIC-004, `/ve-may-bay/dat-ve/[flightId]`) via
 * `buildFlightBookingPath` — the "coming soon" inline-confirmation
 * treatment this component used before EPIC-004 existed has moved
 * forward to `FlightBookingSuccess` (Booking's own CTA), the same way
 * `FlightCard`'s "Chọn" stopped being a dead end once Flight Detail shipped.
 */
export function FlightBookingCTA({
  flightId,
  fareOptionId,
  query,
  backHref,
  sticky = false,
}: {
  flightId: string
  fareOptionId: string
  query: FlightSearchQuery
  backHref: string
  sticky?: boolean
}) {
  const bookingHref = buildFlightBookingPath(flightId, { fareOptionId, ...query })

  const content = (
    <div className="flex flex-col gap-3">
      <MVButton href={bookingHref} variant="accent" size="lg" className="w-full">
        Tiếp tục đặt vé
      </MVButton>
      {!sticky && (
        <MVButton href={backHref} variant="outline" size="md" className="w-full">
          <ArrowLeft className="size-4" />
          Quay lại kết quả
        </MVButton>
      )}
    </div>
  )

  if (!sticky) return content

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur-lg sm:bottom-0 lg:hidden">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-1">
        <Link href={backHref} aria-label="Quay lại kết quả" className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">{content}</div>
      </div>
    </div>
  )
}

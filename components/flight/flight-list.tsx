import { FlightCard } from '@/components/flight/flight-card'
import type { FlightOffer } from '@/types/flight'

export function FlightList({ offers }: { offers: FlightOffer[] }) {
  return (
    <div className="flex flex-col gap-3">
      {offers.map((offer) => (
        <FlightCard key={offer.id} offer={offer} />
      ))}
    </div>
  )
}

import { FlightCard } from '@/components/flight/flight-card'
import type { FlightOffer, FlightSearchQuery } from '@/types/flight'

export function FlightList({ offers, query }: { offers: FlightOffer[]; query: FlightSearchQuery }) {
  return (
    <div className="flex flex-col gap-3">
      {offers.map((offer) => (
        <FlightCard key={offer.id} offer={offer} query={query} />
      ))}
    </div>
  )
}

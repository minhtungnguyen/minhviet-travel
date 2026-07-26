import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { FlightFlashSaleCard } from '@/components/flight/flight-flash-sale-card'
import type { FlightAirport, FlightFlashSale } from '@/types/flight'

function airportLabel(airports: FlightAirport[], code: string) {
  const airport = airports.find((a) => a.code === code)
  return airport ? `${airport.city} (${airport.code})` : code
}

/**
 * Mobile renders as a snap-scroll rail (`grid-flow-col` + `auto-cols`),
 * switching to a normal multi-column grid from `sm:` up — matches
 * EPIC-001 §7's "Card một cột hoặc dạng kéo ngang" for Mobile without a
 * separate client-side carousel component.
 */
export function FlightFlashSaleSection({
  flashSales,
  airports,
}: {
  flashSales: FlightFlashSale[]
  airports: FlightAirport[]
}) {
  const activeSales = flashSales.filter((sale) => sale.isActive)

  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader eyebrow="Flash Sale" title="Ưu đãi vé máy bay đang diễn ra" className="max-w-2xl" />

        {activeSales.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Hiện chưa có ưu đãi nào — vui lòng quay lại sau.</p>
        ) : (
          <div className="mt-8 grid auto-cols-[85%] grid-flow-col gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
            {activeSales.map((sale) => (
              <Reveal key={sale.id} className="snap-start">
                <FlightFlashSaleCard
                  title={sale.title}
                  originLabel={airportLabel(airports, sale.originCode)}
                  destinationLabel={airportLabel(airports, sale.destinationCode)}
                  priceFrom={sale.priceFrom}
                  currency={sale.currency}
                  validUntil={sale.validUntil}
                  image={sale.image}
                  href={sale.href}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

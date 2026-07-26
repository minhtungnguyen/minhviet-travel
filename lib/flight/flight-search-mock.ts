import type {
  FareCalendarDay,
  FlightAirline,
  FlightAirport,
  FlightCabinClass,
  FlightOffer,
  FlightSearchQuery,
  FlightStopCount,
} from '@/types/flight'

/**
 * Deterministic mock fare/schedule generator for Search Results
 * (EPIC-002). Seeded by route + date so the same search always renders
 * the same "prices" (stable UX, and testable) instead of `Math.random()`
 * reshuffling on every render. Swap for `integrations/flight/contracts/flight-provider.ts`
 * when a real fare API exists — every caller only depends on `FlightOffer`/`FareCalendarDay`.
 */

/**
 * mulberry32, seeded from a string hash — small, dependency-free, good
 * enough for mock data (not cryptographic). Exported so
 * `flight-detail-mock.ts` can derive its own deterministic values from
 * the same family of seeds without duplicating the PRNG.
 */
export function createSeededRandom(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let state = h >>> 0
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const CABIN_PRICE_MULTIPLIER: Record<FlightCabinClass, number> = {
  economy: 1,
  premium_economy: 1.6,
  business: 3.2,
  first: 5.5,
}

const CABIN_CHECKED_BAGGAGE_KG: Record<FlightCabinClass, number> = {
  economy: 20,
  premium_economy: 25,
  business: 32,
  first: 40,
}

export function isInternationalRoute(origin: FlightAirport, destination: FlightAirport): boolean {
  return origin.country !== destination.country
}

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step
}

/** `minutesFromMidnight` may exceed 1440 (a long-haul flight departing late and arriving the next day) — `Date.UTC` normalizes the overflow into the date automatically. */
export function combineDateAndMinutes(dateIso: string, minutesFromMidnight: number): string {
  const [year, month, day] = dateIso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, minutesFromMidnight, 0)).toISOString()
}

/** Total party size (adults + children count as full seats; infants fly on lap and don't add a seat, matching `FlightPassengerSelector`). */
export function partySize(query: Pick<FlightSearchQuery, 'adults' | 'children'>): number {
  return query.adults + query.children
}

export function generateFlightOffers(
  query: FlightSearchQuery,
  origin: FlightAirport,
  destination: FlightAirport,
  airlines: FlightAirline[],
): FlightOffer[] {
  const random = createSeededRandom(`${origin.code}-${destination.code}-${query.departDate}-${query.cabinClass}`)
  const international = isInternationalRoute(origin, destination)
  const activeAirlines = airlines.filter((airline) => airline.isActive && (!international || airline.isInternational))

  const basePricePerSeat = international ? 2_500_000 + random() * 6_000_000 : 500_000 + random() * 1_800_000
  const baseDurationMinutes = international ? 180 + random() * 300 : 55 + random() * 70
  const offerCount = 8 + Math.floor(random() * 5)
  const seats = Math.max(1, partySize(query))
  const cabinMultiplier = CABIN_PRICE_MULTIPLIER[query.cabinClass]

  const offers: FlightOffer[] = []
  for (let i = 0; i < offerCount; i++) {
    const airline = activeAirlines[i % activeAirlines.length] ?? airlines[0]
    const flightNumber = `${airline.code}${100 + Math.floor(random() * 899)}`

    const departMinutes = roundToNearest(Math.floor(random() * 24 * 60), 5)
    const durationMinutes = Math.round(baseDurationMinutes * (0.85 + random() * 0.3))

    const stopRoll = random()
    const directChance = international ? 0.5 : 0.75
    const stops: FlightStopCount = stopRoll < directChance ? 0 : stopRoll < directChance + 0.35 ? 1 : 2
    const stopAirportCodes =
      stops === 0
        ? []
        : Array.from({ length: stops }, () => (international ? 'BKK' : 'SGN')).filter((code) => code !== origin.code && code !== destination.code)

    const stopPenalty = stops === 0 ? 1.08 : stops === 1 ? 0.92 : 0.8
    const priceVariance = 0.85 + random() * 0.5
    const pricePerSeat = Math.round((basePricePerSeat * cabinMultiplier * stopPenalty * priceVariance) / 10_000) * 10_000

    offers.push({
      id: `offer-${origin.code}-${destination.code}-${query.departDate}-${i}`,
      airlineCode: airline.code,
      airlineName: airline.name,
      flightNumber,
      originCode: origin.code,
      destinationCode: destination.code,
      departTime: combineDateAndMinutes(query.departDate, departMinutes),
      arriveTime: combineDateAndMinutes(query.departDate, departMinutes + durationMinutes),
      durationMinutes,
      stops,
      stopAirportCodes,
      cabinClass: query.cabinClass,
      baggage: { carryOnKg: 7, checkedKg: CABIN_CHECKED_BAGGAGE_KG[query.cabinClass] },
      price: pricePerSeat * seats,
      currency: 'VND',
      isRecommended: false,
    })
  }

  let recommendedIndex = 0
  let bestScore = Infinity
  offers.forEach((offer, index) => {
    const score = offer.price * 0.6 + offer.durationMinutes * 1000 * 0.4
    if (score < bestScore) {
      bestScore = score
      recommendedIndex = index
    }
  })
  offers[recommendedIndex] = { ...offers[recommendedIndex], isRecommended: true }

  return offers
}

const FARE_CALENDAR_SPAN_DAYS = 3

export function generateFareCalendar(query: FlightSearchQuery, origin: FlightAirport, destination: FlightAirport): FareCalendarDay[] {
  const random = createSeededRandom(`fare-calendar-${origin.code}-${destination.code}-${query.departDate}`)
  const international = isInternationalRoute(origin, destination)
  const basePrice = international ? 2_500_000 + random() * 6_000_000 : 500_000 + random() * 1_800_000

  const [year, month, day] = query.departDate.split('-').map(Number)
  const centerDate = new Date(Date.UTC(year, month - 1, day))

  const days: FareCalendarDay[] = []
  for (let offset = -FARE_CALENDAR_SPAN_DAYS; offset <= FARE_CALENDAR_SPAN_DAYS; offset++) {
    const date = new Date(centerDate)
    date.setUTCDate(date.getUTCDate() + offset)
    const priceFrom = Math.round((basePrice * (0.85 + random() * 0.35)) / 10_000) * 10_000
    days.push({
      date: date.toISOString().slice(0, 10),
      priceFrom,
      currency: 'VND',
      isCheapest: false,
      isSelected: offset === 0,
    })
  }

  const cheapest = days.reduce((min, current) => (current.priceFrom < min.priceFrom ? current : min), days[0])
  return days.map((day) => (day.date === cheapest.date ? { ...day, isCheapest: true } : day))
}

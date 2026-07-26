import {
  createSeededRandom,
  CABIN_PRICE_MULTIPLIER,
  combineDateAndMinutes,
  isInternationalRoute,
  partySize,
} from '@/lib/flight/flight-search-mock'
import type {
  FareOption,
  FareOptionTier,
  FlightAirport,
  FlightDetail,
  FlightFareRules,
  FlightLayover,
  FlightOffer,
  FlightSearchQuery,
  FlightSegment,
} from '@/types/flight'

/**
 * Deterministic Flight Detail generator (EPIC-003). Seeded by `offer.id`
 * (which already encodes origin/destination/departDate/index — see
 * `flight-search-mock.ts`), so re-deriving detail for the same flight
 * always produces the same segments/fare options, without persisting
 * anything. Swap for `integrations/flight/contracts/flight-provider.ts`
 * when a real fare API exists — every caller only depends on `FlightDetail`.
 */

const DOMESTIC_AIRCRAFT = ['Airbus A321', 'Airbus A320neo', 'Boeing 737 MAX 8', 'ATR 72']
const INTERNATIONAL_AIRCRAFT = ['Boeing 787-9', 'Airbus A350-900', 'Airbus A321neo', 'Boeing 777-300ER']

function pickAircraft(random: () => number, international: boolean): string {
  const pool = international ? INTERNATIONAL_AIRCRAFT : DOMESTIC_AIRCRAFT
  return pool[Math.floor(random() * pool.length)]
}

function fallbackLayoverAirport(random: () => number, international: boolean): string {
  const pool = international ? ['BKK', 'SIN', 'HAN'] : ['SGN', 'HAN', 'DAD']
  return pool[Math.floor(random() * pool.length)]
}

/**
 * Distributes `total` across `weights.length` buckets proportionally to
 * `weights`, rounding every bucket except the last, which absorbs the
 * rounding remainder — guarantees `sum(result) === total` exactly.
 */
function distributeExactly(weights: number[], total: number): number[] {
  const weightSum = weights.reduce((sum, w) => sum + w, 0)
  if (weightSum === 0 || weights.length === 0) return weights.map(() => 0)

  const result = weights.slice(0, -1).map((w) => Math.round((total * w) / weightSum))
  const allocated = result.reduce((sum, m) => sum + m, 0)
  result.push(total - allocated)
  return result
}

function buildSegments(
  offer: FlightOffer,
  origin: FlightAirport,
  destination: FlightAirport,
): { segments: FlightSegment[]; layovers: FlightLayover[] } {
  const random = createSeededRandom(`detail-segments-${offer.id}`)
  const international = isInternationalRoute(origin, destination)
  const legCount = offer.stops + 1

  if (legCount === 1) {
    return {
      segments: [
        {
          originCode: offer.originCode,
          destinationCode: offer.destinationCode,
          departTime: offer.departTime,
          arriveTime: offer.arriveTime,
          durationMinutes: offer.durationMinutes,
          airlineCode: offer.airlineCode,
          airlineName: offer.airlineName,
          flightNumber: offer.flightNumber,
          aircraft: pickAircraft(random, international),
        },
      ],
      layovers: [],
    }
  }

  // Both layovers and legs are distributed with the *last* element absorbing
  // the rounding remainder, so `sum(legMinutes) + sum(layoverMinutes)` always
  // equals `offer.durationMinutes` exactly — never approximately (verified
  // by flight-detail-mock.test.ts, since the Detail page's segment times
  // must reconcile with the Search Results card's depart/arrive times).
  const minLegMinutes = 15
  const rawLayoverMinutes = Array.from({ length: offer.stops }, () => Math.round((45 + random() * 90) / 5) * 5)
  const rawLayoverTotal = rawLayoverMinutes.reduce((sum, m) => sum + m, 0)
  const layoverBudget = Math.max(0, offer.durationMinutes - legCount * minLegMinutes)
  const totalLayover = Math.min(rawLayoverTotal, layoverBudget)

  const layoverMinutes = distributeExactly(rawLayoverMinutes, totalLayover)
  const totalFlightMinutes = offer.durationMinutes - totalLayover

  const legWeights = Array.from({ length: legCount }, () => 0.7 + random() * 0.6)
  const legMinutes = distributeExactly(legWeights, totalFlightMinutes)

  const stopAirports = Array.from(
    { length: offer.stops },
    (_, i) => offer.stopAirportCodes[i] ?? fallbackLayoverAirport(random, international),
  )
  const waypoints = [offer.originCode, ...stopAirports, offer.destinationCode]

  const departMinutesOfDay =
    new Date(offer.departTime).getUTCHours() * 60 + new Date(offer.departTime).getUTCMinutes()
  const departDateIso = offer.departTime.slice(0, 10)

  const segments: FlightSegment[] = []
  let cursorMinutes = departMinutesOfDay
  for (let i = 0; i < legCount; i++) {
    const legDeparture = combineDateAndMinutes(departDateIso, cursorMinutes)
    cursorMinutes += legMinutes[i]
    const legArrival = combineDateAndMinutes(departDateIso, cursorMinutes)
    segments.push({
      originCode: waypoints[i],
      destinationCode: waypoints[i + 1],
      departTime: legDeparture,
      arriveTime: legArrival,
      durationMinutes: legMinutes[i],
      airlineCode: offer.airlineCode,
      airlineName: offer.airlineName,
      flightNumber: i === 0 ? offer.flightNumber : `${offer.airlineCode}${100 + Math.floor(random() * 899)}`,
      aircraft: pickAircraft(random, international),
    })
    if (i < offer.stops) cursorMinutes += layoverMinutes[i]
  }

  const layovers: FlightLayover[] = stopAirports.map((airportCode, i) => ({
    airportCode,
    durationMinutes: layoverMinutes[i],
  }))

  return { segments, layovers }
}

interface FareTierDefinition {
  tier: FareOptionTier
  name: string
  multiplier: number
  checkedKg: number
  mealIncluded: boolean
  seatSelectionIncluded: boolean
  changePolicy: string
  refundPolicy: string
  changeFeeRate: number | null
  refundFeeRate: number | null
}

const FARE_TIERS: FareTierDefinition[] = [
  {
    tier: 'economy_saver',
    name: 'Economy Saver',
    multiplier: 0.82,
    checkedKg: 0,
    mealIncluded: false,
    seatSelectionIncluded: false,
    changePolicy: 'Không được đổi vé',
    refundPolicy: 'Không được hoàn vé',
    changeFeeRate: null,
    refundFeeRate: null,
  },
  {
    tier: 'economy_standard',
    name: 'Economy Standard',
    multiplier: 1,
    checkedKg: 20,
    mealIncluded: false,
    seatSelectionIncluded: false,
    changePolicy: 'Đổi vé có phí',
    refundPolicy: 'Không được hoàn vé',
    changeFeeRate: 0.15,
    refundFeeRate: null,
  },
  {
    tier: 'economy_flex',
    name: 'Economy Flex',
    multiplier: 1.35,
    checkedKg: 23,
    mealIncluded: true,
    seatSelectionIncluded: true,
    changePolicy: 'Đổi vé miễn phí',
    refundPolicy: 'Hoàn vé có phí',
    changeFeeRate: 0,
    refundFeeRate: 0.2,
  },
  {
    tier: 'business',
    name: 'Business',
    multiplier: CABIN_PRICE_MULTIPLIER.business,
    checkedKg: 32,
    mealIncluded: true,
    seatSelectionIncluded: true,
    changePolicy: 'Đổi vé miễn phí',
    refundPolicy: 'Hoàn vé miễn phí',
    changeFeeRate: 0,
    refundFeeRate: 0,
  },
]

function roundTo10k(value: number): number {
  return Math.round(value / 10_000) * 10_000
}

/** Which fare tier is pre-selected by default, matching the cabin class the user actually searched with. */
function defaultTierFor(cabinClass: FlightSearchQuery['cabinClass']): FareOptionTier {
  return cabinClass === 'business' || cabinClass === 'first' ? 'business' : 'economy_standard'
}

function buildFareOptions(offer: FlightOffer, query: FlightSearchQuery): FareOption[] {
  const seats = Math.max(1, partySize(query))
  const perPaxAtSearchedCabin = offer.price / seats
  // Fare tiers are priced relative to the Economy baseline, not the searched cabin's price, so
  // a Business search doesn't double-apply the cabin multiplier already baked into `offer.price`.
  const economyBasePerPax = perPaxAtSearchedCabin / CABIN_PRICE_MULTIPLIER[query.cabinClass]
  const recommendedTier = defaultTierFor(query.cabinClass)

  return FARE_TIERS.map((def) => {
    const totalPrice = roundTo10k(economyBasePerPax * def.multiplier)
    const baseFare = roundTo10k(totalPrice * 0.75)
    const taxes = roundTo10k(totalPrice * 0.18)
    const serviceFee = totalPrice - baseFare - taxes

    return {
      id: `${offer.id}-fare-${def.tier}`,
      tier: def.tier,
      name: def.name,
      baseFare,
      taxes,
      serviceFee,
      totalPrice,
      currency: 'VND',
      baggage: { carryOnKg: 7, checkedKg: def.checkedKg },
      mealIncluded: def.mealIncluded,
      seatSelectionIncluded: def.seatSelectionIncluded,
      changePolicy: def.changePolicy,
      refundPolicy: def.refundPolicy,
      changeFee: def.changeFeeRate === null ? null : roundTo10k(totalPrice * def.changeFeeRate),
      refundFee: def.refundFeeRate === null ? null : roundTo10k(totalPrice * def.refundFeeRate),
      isRecommended: def.tier === recommendedTier,
    }
  })
}

function buildFareRules(offer: FlightOffer): FlightFareRules {
  const random = createSeededRandom(`detail-rules-${offer.id}`)
  return {
    changeConditions:
      'Áp dụng phí đổi vé theo hạng vé đã chọn. Chỉ được đổi trước giờ khởi hành tối thiểu 24 giờ. Chênh lệch giá vé (nếu có) do hành khách thanh toán thêm.',
    refundConditions:
      'Chỉ các hạng vé cho phép hoàn (xem điều kiện từng hạng vé phía trên) mới được hoàn. Thời gian xử lý hoàn tiền dự kiến 7–14 ngày làm việc kể từ khi yêu cầu được duyệt.',
    noShowPolicy: 'Hành khách không có mặt làm thủ tục (no-show) sẽ mất toàn bộ giá trị vé, không được hoàn hoặc đổi.',
    holdDeadlineMinutes: Math.round((60 + random() * 180) / 15) * 15,
    priceDisclaimer: 'Giá hiện tại là giá tham khảo từ Mock Data và chưa phải giá giữ chỗ thực tế.',
  }
}

export function generateFlightDetail(
  offer: FlightOffer,
  query: FlightSearchQuery,
  origin: FlightAirport,
  destination: FlightAirport,
): FlightDetail {
  const { segments, layovers } = buildSegments(offer, origin, destination)
  const fareOptions = buildFareOptions(offer, query)

  return {
    id: offer.id,
    origin,
    destination,
    airlineCode: offer.airlineCode,
    airlineName: offer.airlineName,
    flightNumber: offer.flightNumber,
    aircraft: segments[0].aircraft,
    cabinClass: query.cabinClass,
    segments,
    layovers,
    durationMinutes: offer.durationMinutes,
    stops: offer.stops,
    fareOptions,
    fareRules: buildFareRules(offer),
    defaultFareOptionId: `${offer.id}-fare-${defaultTierFor(query.cabinClass)}`,
    query,
  }
}

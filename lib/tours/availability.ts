import type {
  AvailabilityConfig,
  AvailabilityCta,
  DerivedAvailability,
  TourAvailabilityStatus,
  TourCardViewModel,
  TourDeparture,
} from '@/types/tour-availability'

/**
 * Pure, dependency-free derivation logic for "Tour Availability As
 * Logical Sales Signal". Every function here takes its inputs
 * explicitly (including `now`) and returns a value — no DOM, no
 * fetching, no hidden clock reads — so it's trivial to unit test with
 * fixed dates. See `availability.test.ts`.
 */

export const STATUS_LABELS: Record<TourAvailabilityStatus, string> = {
  AVAILABLE: 'Còn chỗ',
  LIMITED: 'Sắp đủ chỗ',
  CHECKING: 'Đang kiểm tra chỗ',
  SOLD_OUT: 'Hết chỗ',
  CLOSED: 'Ngừng nhận khách',
}

/** Not hard-coded inline per the brief's §10 — one named, overridable config value. */
export const DEFAULT_AVAILABILITY_CONFIG: AvailabilityConfig = {
  limitedSeatsThreshold: 5,
}

function toTime(value: string): number {
  return new Date(value).getTime()
}

/**
 * §9 rules 1–3: drop past and inactive departures, then prefer the
 * soonest one that can still take guests (per §2's "ưu tiên ngày gần
 * nhất còn nhận khách"). Only when *nothing* can still take guests do we
 * fall back to the soonest SOLD_OUT departure so the card can show an
 * honest "Hết chỗ" for a real, specific date instead of nothing. If
 * every remaining departure is CLOSED (or has unknown status), the
 * soonest one is still returned as-is — CLOSED is a legitimate terminal
 * state to surface, not an error state to hide.
 */
export function selectPrimaryDeparture(departures: TourDeparture[], now: Date): TourDeparture | null {
  const eligible = departures
    .filter((d) => d.isActive && toTime(d.departureDate) >= now.getTime())
    .sort((a, b) => toTime(a.departureDate) - toTime(b.departureDate))

  if (eligible.length === 0) return null

  const acceptingGuests = eligible.filter(
    (d) => d.availabilityStatus !== 'SOLD_OUT' && d.availabilityStatus !== 'CLOSED',
  )
  if (acceptingGuests.length > 0) return acceptingGuests[0]

  const soldOut = eligible.filter((d) => d.availabilityStatus === 'SOLD_OUT')
  if (soldOut.length > 0) return soldOut[0]

  return eligible[0]
}

/**
 * §9 rules 4–6 + §10 (urgency ethics): never invent a status or seat
 * count. A missing/null departure or a null `availabilityStatus` always
 * resolves to CHECKING — the honest "we don't know yet" state — never to
 * a guessed AVAILABLE or a fabricated LIMITED.
 *
 * One real business rule beyond a plain enum pass-through: CLOSED's own
 * definition ("đã ngừng nhận khách HOẶC hết thời hạn bán") means a
 * departure whose `saleCloseAt` has already passed is CLOSED regardless
 * of whatever raw status it was last saved with — the sale window
 * closing is the more authoritative fact. And per §10, "LIMITED chỉ
 * được dùng khi availableSeats có dữ liệu thật và dưới ngưỡng" — an
 * AVAILABLE departure gets promoted to LIMITED the moment real seat
 * data crosses the configured threshold, even if the raw status hasn't
 * caught up yet.
 */
export function deriveDepartureAvailability(
  departure: TourDeparture | null,
  now: Date,
  config: AvailabilityConfig = DEFAULT_AVAILABILITY_CONFIG,
): DerivedAvailability {
  if (!departure) {
    return { status: 'CHECKING', label: STATUS_LABELS.CHECKING, availableSeats: null, isUrgent: false }
  }

  if (departure.saleCloseAt && toTime(departure.saleCloseAt) < now.getTime()) {
    return {
      status: 'CLOSED',
      label: STATUS_LABELS.CLOSED,
      availableSeats: departure.availableSeats,
      isUrgent: false,
    }
  }

  if (departure.availabilityStatus == null) {
    return {
      status: 'CHECKING',
      label: STATUS_LABELS.CHECKING,
      availableSeats: departure.availableSeats,
      isUrgent: false,
    }
  }

  let status = departure.availabilityStatus
  if (
    status === 'AVAILABLE' &&
    typeof departure.availableSeats === 'number' &&
    departure.availableSeats <= config.limitedSeatsThreshold
  ) {
    status = 'LIMITED'
  }

  return {
    status,
    label: STATUS_LABELS[status],
    availableSeats: departure.availableSeats,
    isUrgent: status === 'LIMITED',
  }
}

interface CtaTarget {
  href: string
  category: string
}

/** §5 — CTA label/action/href, never the same for every status. */
export function mapAvailabilityToCTA(
  availability: DerivedAvailability,
  target: CtaTarget,
  departureId?: string,
): AvailabilityCta {
  switch (availability.status) {
    case 'AVAILABLE':
      return { label: 'Khám phá tour', action: 'view-detail', href: target.href }
    case 'LIMITED':
      return {
        label: 'Giữ chỗ tư vấn',
        action: 'prefill-inquiry',
        href: departureId ? `${target.href}?departure=${departureId}` : target.href,
      }
    case 'CHECKING':
      return { label: 'Kiểm tra chỗ', action: 'check-availability', href: '#lead-form' }
    case 'SOLD_OUT':
      return { label: 'Xem lịch khác', action: 'view-alternate-dates', href: `${target.href}#departures` }
    case 'CLOSED':
      return {
        label: 'Xem tour tương tự',
        action: 'view-similar-tours',
        href: `/tours?category=${target.category}`,
      }
  }
}

/** Orchestrates the three functions above into the one view model `JourneyCard` renders. */
export function buildTourCardViewModel<TTour extends CtaTarget & { id: string; departures: TourDeparture[] }>(
  tour: TTour,
  now: Date = new Date(),
  config: AvailabilityConfig = DEFAULT_AVAILABILITY_CONFIG,
): TourCardViewModel<TTour> {
  const primaryDeparture = selectPrimaryDeparture(tour.departures, now)
  const availability = deriveDepartureAvailability(primaryDeparture, now, config)
  const cta = mapAvailabilityToCTA(availability, tour, primaryDeparture?.id)

  return { tour, primaryDeparture, availability, cta }
}

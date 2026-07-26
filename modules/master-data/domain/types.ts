/**
 * Domain types for database/migrations/0003_master_data_core.sql and
 * 0007_master_data_extended.sql. Every table here has zero coupling to
 * any specific vertical (no tour_id/flight_id/etc. anywhere) — that's
 * what makes it reusable across Tour, Flight, Hotel, Cruise, Ticket,
 * Visa and Insurance once those domains exist, without a breaking change
 * to any of these types or the repository/service methods that return
 * them. `airports`/`airlines` are deliberately absent: neither exists in
 * the approved 47-table schema (airports was deferred to the Flight
 * domain's own migration in Sprint 1A.2; airlines never existed) — see
 * docs/backend/sprint-1b2-implementation-plan.md.
 */

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export type Currency = {
  code: string
  name: string
  symbol: string
  decimalDigits: number
  status: EntityStatus
}

export type Language = {
  code: string
  name: string
  nativeName: string
  status: EntityStatus
}

export type Country = {
  code: string
  name: string
  nativeName: string | null
  region: string | null
  defaultCurrencyCode: string | null
  status: EntityStatus
}

export type Province = {
  id: string
  countryCode: string
  name: string
  code: string
  status: EntityStatus
}

export type City = {
  id: string
  provinceId: string
  name: string
  status: EntityStatus
}

export type DestinationType = 'COUNTRY' | 'REGION' | 'PROVINCE_CITY' | 'DESTINATION' | 'ATTRACTION'

export type Destination = {
  id: string
  parentDestinationId: string | null
  destinationType: DestinationType
  countryCode: string | null
  latitude: number | null
  longitude: number | null
  isFeatured: boolean
  status: EntityStatus
  deletedAt: string | null
}

export type DestinationTranslation = {
  id: string
  destinationId: string
  locale: string
  name: string
  slug: string
  description: string | null
}

export type ProductType = {
  id: string
  code: string
  name: string
  status: EntityStatus
}

export type CustomerType = {
  id: string
  code: string
  name: string
  status: EntityStatus
}

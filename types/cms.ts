/**
 * Shared CMS primitives. Every editorial field that can appear on the
 * homepage is expressed through these types so a real CMS (Sanity,
 * Contentful, a custom Supabase table, etc.) can be swapped in behind
 * `lib/cms/client.ts` without touching section or component code.
 */

export interface CmsImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface CmsLink {
  label: string
  href: string
}

/**
 * Any number shown to a visitor as proof (stats, counts, ratings) must
 * carry its own sourcing metadata. This exists specifically so a stat
 * cannot be added to content without also declaring where it came from
 * and when it was last verified — see Volume 01 "Trust Before Revenue"
 * and Volume 02 Ch.8 (Trust Signals).
 */
export interface VerifiedStat {
  id: string
  value: number
  suffix?: string
  label: string
  source: string
  asOf: string
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

/**
 * Availability must be expressed as one of Volume 02's approved status
 * labels (Ch.10.3), never as an invented countdown or seat counter.
 */
export type AvailabilityStatus =
  | 'open'
  | 'limited'
  | 'almost-full'
  | 'closed'
  | 'pending-confirmation'

export type PriceType = 'estimate' | 'confirmed'

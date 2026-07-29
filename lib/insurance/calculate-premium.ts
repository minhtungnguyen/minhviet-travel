import type { InsurancePlanCode, InsuranceZone, PremiumRate } from '@/types/insurance'
import { findDurationBand, type DurationBand } from '@/lib/insurance/insurance-duration-bands'

export interface PremiumCalculatorInput {
  zone: InsuranceZone
  plan: InsurancePlanCode
  /** ISO yyyy-mm-dd */
  tripStartDate: string
  /** ISO yyyy-mm-dd */
  tripEndDate: string
  travelerCount: number
  isFamily: boolean
}

export interface PremiumCalculatorResult {
  durationDays: number
  band: DurationBand
  individualPremium: { usd: number; vnd: number }
  totalPremium: { usd: number; vnd: number }
  travelerCount: number
  isFamily: boolean
}

export type PremiumCalculatorError =
  | { code: 'INVALID_DATES' }
  | { code: 'DURATION_OUT_OF_RANGE'; days: number }
  | { code: 'RATE_NOT_FOUND' }

function diffInclusiveDays(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00Z`)
  const end = new Date(`${endIso}T00:00:00Z`)
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1
}

/**
 * Pure, framework-agnostic — runs client-side for instant recalculation
 * as the user changes fields (no server round-trip needed since the
 * whole rate table is small, static public data).
 *
 * Trip duration is inclusive of both the start and end date (a 3-day
 * trip departing and returning on the same calendar span is "3 days",
 * not 2) — matches how DBV's own "Thời gian chuyến đi (Ngày)" column
 * reads on the rate card.
 *
 * Family premium formula is transcribed exactly as printed on
 * docs/insurance/Tờ rơi du lịch quốc tế DBV.pdf page 5: "Phí bảo hiểm
 * (gia đình) = Phí bảo hiểm (cá nhân) × (Số người trong gia đình – 1)" —
 * do not "fix" this even though it looks unusual — it's the per-family
 * total (one member's premium, plus (n-1) more), not a per-additional-
 * member surcharge on top of some other base fee.
 */
export function calculatePremium(input: PremiumCalculatorInput, rates: PremiumRate[]): PremiumCalculatorResult | PremiumCalculatorError {
  const { zone, plan, tripStartDate, tripEndDate, travelerCount, isFamily } = input

  const start = new Date(`${tripStartDate}T00:00:00Z`)
  const end = new Date(`${tripEndDate}T00:00:00Z`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return { code: 'INVALID_DATES' }
  }

  const durationDays = diffInclusiveDays(tripStartDate, tripEndDate)
  const band = findDurationBand(durationDays)
  if (!band) return { code: 'DURATION_OUT_OF_RANGE', days: durationDays }

  const rate = rates.find((r) => r.zone === zone && r.plan === plan && r.minDays === band.minDays && r.maxDays === band.maxDays)
  if (!rate) return { code: 'RATE_NOT_FOUND' }

  const individualPremium = rate.rate
  const multiplier = isFamily ? Math.max(travelerCount - 1, 1) : 1
  const totalPremium = { usd: individualPremium.usd * multiplier, vnd: individualPremium.vnd * multiplier }

  return { durationDays, band, individualPremium, totalPremium, travelerCount, isFamily }
}

export function isPremiumCalculatorError(result: PremiumCalculatorResult | PremiumCalculatorError): result is PremiumCalculatorError {
  return 'code' in result
}

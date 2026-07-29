import { describe, expect, it } from 'vitest'
import { calculatePremium, isPremiumCalculatorError } from '@/lib/insurance/calculate-premium'
import type { PremiumRate } from '@/types/insurance'

const FIXTURE_RATES: PremiumRate[] = [
  { zone: 'SOUTHEAST_ASIA', plan: 'A', minDays: 1, maxDays: 5, rate: { usd: 7, vnd: 140_000 } },
  { zone: 'SOUTHEAST_ASIA', plan: 'A', minDays: 6, maxDays: 8, rate: { usd: 9, vnd: 180_000 } },
  { zone: 'SOUTHEAST_ASIA', plan: 'B', minDays: 1, maxDays: 5, rate: { usd: 8, vnd: 171_000 } },
  { zone: 'GLOBAL', plan: 'C', minDays: 173, maxDays: 180, rate: { usd: 221, vnd: 4_420_000 } },
]

describe('calculatePremium', () => {
  it('looks up the correct band at the lower boundary (day 1)', () => {
    const result = calculatePremium(
      { zone: 'SOUTHEAST_ASIA', plan: 'A', tripStartDate: '2026-08-01', tripEndDate: '2026-08-01', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    expect(isPremiumCalculatorError(result)).toBe(false)
    if (isPremiumCalculatorError(result)) throw new Error('unreachable')
    expect(result.durationDays).toBe(1)
    expect(result.band).toEqual({ minDays: 1, maxDays: 5 })
    expect(result.individualPremium).toEqual({ usd: 7, vnd: 140_000 })
  })

  it('looks up the correct band at the upper boundary (day 5) — same band as day 1', () => {
    const result = calculatePremium(
      { zone: 'SOUTHEAST_ASIA', plan: 'A', tripStartDate: '2026-08-01', tripEndDate: '2026-08-05', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    if (isPremiumCalculatorError(result)) throw new Error('unreachable')
    expect(result.durationDays).toBe(5)
    expect(result.individualPremium).toEqual({ usd: 7, vnd: 140_000 })
  })

  it('crosses into the next band at day 6 — premium changes discretely, not smoothly', () => {
    const result = calculatePremium(
      { zone: 'SOUTHEAST_ASIA', plan: 'A', tripStartDate: '2026-08-01', tripEndDate: '2026-08-06', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    if (isPremiumCalculatorError(result)) throw new Error('unreachable')
    expect(result.durationDays).toBe(6)
    expect(result.band).toEqual({ minDays: 6, maxDays: 8 })
    expect(result.individualPremium).toEqual({ usd: 9, vnd: 180_000 })
  })

  it('resolves the last band (173–180 days) — 2026-01-01 to 2026-06-29 is exactly 180 inclusive days in this non-leap year', () => {
    const result = calculatePremium(
      { zone: 'GLOBAL', plan: 'C', tripStartDate: '2026-01-01', tripEndDate: '2026-06-29', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    if (isPremiumCalculatorError(result)) throw new Error('unreachable')
    expect(result.durationDays).toBe(180)
    expect(result.band).toEqual({ minDays: 173, maxDays: 180 })
    expect(result.individualPremium).toEqual({ usd: 221, vnd: 4_420_000 })
  })

  it('rejects a trip longer than 180 days — 2026-01-01 to 2026-06-30 is 181 inclusive days', () => {
    const result = calculatePremium(
      { zone: 'GLOBAL', plan: 'C', tripStartDate: '2026-01-01', tripEndDate: '2026-06-30', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    expect(result).toEqual({ code: 'DURATION_OUT_OF_RANGE', days: 181 })
  })

  it('rejects an end date before the start date', () => {
    const result = calculatePremium(
      { zone: 'SOUTHEAST_ASIA', plan: 'A', tripStartDate: '2026-08-10', tripEndDate: '2026-08-01', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    expect(result).toEqual({ code: 'INVALID_DATES' })
  })

  it('rejects an invalid date string', () => {
    const result = calculatePremium(
      { zone: 'SOUTHEAST_ASIA', plan: 'A', tripStartDate: 'not-a-date', tripEndDate: '2026-08-01', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    expect(result).toEqual({ code: 'INVALID_DATES' })
  })

  it('returns RATE_NOT_FOUND when no matching rate exists for the zone/plan/band', () => {
    const result = calculatePremium(
      { zone: 'ASIA_AUS_NZ', plan: 'A', tripStartDate: '2026-08-01', tripEndDate: '2026-08-01', travelerCount: 1, isFamily: false },
      FIXTURE_RATES,
    )
    expect(result).toEqual({ code: 'RATE_NOT_FOUND' })
  })

  it('applies the family multiplier exactly as printed on the DBV rate sheet: individual × (travelerCount − 1)', () => {
    const result = calculatePremium(
      { zone: 'SOUTHEAST_ASIA', plan: 'A', tripStartDate: '2026-08-01', tripEndDate: '2026-08-01', travelerCount: 4, isFamily: true },
      FIXTURE_RATES,
    )
    if (isPremiumCalculatorError(result)) throw new Error('unreachable')
    expect(result.totalPremium).toEqual({ usd: 7 * 3, vnd: 140_000 * 3 })
  })

  it('does not apply the family multiplier when isFamily is false, regardless of travelerCount', () => {
    const result = calculatePremium(
      { zone: 'SOUTHEAST_ASIA', plan: 'A', tripStartDate: '2026-08-01', tripEndDate: '2026-08-01', travelerCount: 4, isFamily: false },
      FIXTURE_RATES,
    )
    if (isPremiumCalculatorError(result)) throw new Error('unreachable')
    expect(result.totalPremium).toEqual({ usd: 7, vnd: 140_000 })
  })
})

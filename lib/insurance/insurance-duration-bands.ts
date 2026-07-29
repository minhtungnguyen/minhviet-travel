/**
 * The 26 trip-duration bands DBV's rate card is bucketed into (Tờ rơi du
 * lịch quốc tế DBV.pdf, pages 5–6) — every zone × plan premium is looked
 * up against one of these bands, never a raw day count. Max trip length
 * is 180 days (DBV eligibility rule, same PDF page 2).
 */
export interface DurationBand {
  minDays: number
  maxDays: number
}

export const INSURANCE_DURATION_BANDS: DurationBand[] = [
  { minDays: 1, maxDays: 5 },
  { minDays: 6, maxDays: 8 },
  { minDays: 9, maxDays: 15 },
  { minDays: 16, maxDays: 20 },
  { minDays: 21, maxDays: 24 },
  { minDays: 25, maxDays: 31 },
  { minDays: 32, maxDays: 38 },
  { minDays: 39, maxDays: 45 },
  { minDays: 46, maxDays: 52 },
  { minDays: 53, maxDays: 60 },
  { minDays: 61, maxDays: 67 },
  { minDays: 68, maxDays: 75 },
  { minDays: 76, maxDays: 83 },
  { minDays: 84, maxDays: 90 },
  { minDays: 91, maxDays: 98 },
  { minDays: 99, maxDays: 105 },
  { minDays: 106, maxDays: 113 },
  { minDays: 114, maxDays: 120 },
  { minDays: 121, maxDays: 128 },
  { minDays: 129, maxDays: 136 },
  { minDays: 137, maxDays: 143 },
  { minDays: 144, maxDays: 150 },
  { minDays: 151, maxDays: 158 },
  { minDays: 159, maxDays: 165 },
  { minDays: 166, maxDays: 172 },
  { minDays: 173, maxDays: 180 },
]

export const INSURANCE_MAX_TRIP_DAYS = 180

/** Returns `null` when `days` is outside the insurable range (< 1 or > 180). */
export function findDurationBand(days: number): DurationBand | null {
  return INSURANCE_DURATION_BANDS.find((band) => days >= band.minDays && days <= band.maxDays) ?? null
}

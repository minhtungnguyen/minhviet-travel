/**
 * Pure display formatters for Search Results (EPIC-002). Use the UTC
 * getters explicitly — `flight-search-mock.ts` builds offer times with
 * `Date.UTC`, and formatting with `toLocaleTimeString()` (server locale)
 * would render a different clock time on the server than in the
 * browser, causing a hydration mismatch.
 */

export function formatClockTime(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins === 0 ? `${hours}h` : `${hours}h${String(mins).padStart(2, '0')}`
}

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`
}

export function formatStopsLabel(stops: number): string {
  if (stops === 0) return 'Bay thẳng'
  return `${stops} điểm dừng`
}

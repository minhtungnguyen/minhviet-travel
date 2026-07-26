import { flightBookingDraftSchema } from '@/lib/flight/flight-booking-schema'
import type { FlightBookingDraft } from '@/types/flight'

/**
 * Client-only booking draft storage (EPIC-005). See `types/flight.ts`'s
 * `FlightBookingDraft` doc comment for why this is `sessionStorage`
 * rather than a server-persisted booking or URL-encoded data: no
 * Booking domain exists yet, and passenger contact/document data must
 * never travel through a URL. This means a booking draft only survives
 * within the same browser tab session that created it — opening the
 * payment link in a new tab, or after closing the browser, will
 * correctly show the "Booking không tồn tại" state (PRD §8 "Booking
 * phải tồn tại"), which is an accurate reflection of a client-only mock,
 * not a bug.
 */

const STORAGE_KEY_PREFIX = 'mv-flight-booking:'

export function generateBookingId(): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)
  return `booking-${Date.now().toString(36)}-${random}`
}

export function saveBookingDraft(draft: FlightBookingDraft): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY_PREFIX + draft.bookingId, JSON.stringify(draft))
}

/** Returns `null` for a missing or malformed entry — never throws, since this reads state the caller doesn't control (another tab, a cleared session, manual tampering). */
export function loadBookingDraft(bookingId: string): FlightBookingDraft | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(STORAGE_KEY_PREFIX + bookingId)
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  const result = flightBookingDraftSchema.safeParse(parsed)
  return result.success ? result.data : null
}

export function clearBookingDraft(bookingId: string): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(STORAGE_KEY_PREFIX + bookingId)
}

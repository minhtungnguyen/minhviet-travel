import { useRef, useSyncExternalStore } from 'react'
import { loadBookingDraft } from '@/lib/flight/flight-booking-draft'
import type { FlightBookingDraft } from '@/types/flight'

function subscribe(): () => void {
  return () => {}
}

function getServerSnapshot(): FlightBookingDraft | null | undefined {
  return undefined
}

/**
 * Reads a booking draft from `sessionStorage` in a way that's safe across
 * server/client hydration (EPIC-005). `sessionStorage` doesn't exist on
 * the server, so a plain render-time read would make the client's first
 * render diverge from the server's and throw a hydration mismatch (React
 * error #418) — this happened with an earlier `useState(() =>
 * loadBookingDraft(...))` version of this read.
 *
 * `useSyncExternalStore` is the mechanism React provides for exactly this
 * "value differs between server and client" case (same pattern as
 * `HeroVideoRotator`'s `prefers-reduced-motion` check): the server and
 * the client's hydration-matching render both use `getServerSnapshot`
 * (`undefined`, meaning "not yet resolved"), then React swaps in the
 * real client value right after mount — no manual effect + `setState`
 * needed, which also avoids `react-hooks/set-state-in-effect`.
 *
 * The draft never changes during a mount for a given `bookingId` (it's
 * written once by the booking form before navigating here), so
 * `subscribe` is a no-op; a ref caches the loaded value so repeated
 * `getSnapshot` calls return the same reference instead of a fresh
 * `JSON.parse` result each time.
 */
export function useBookingDraft(bookingId: string): FlightBookingDraft | null | undefined {
  const cacheRef = useRef<{ bookingId: string; value: FlightBookingDraft | null } | null>(null)

  function getSnapshot(): FlightBookingDraft | null {
    if (!cacheRef.current || cacheRef.current.bookingId !== bookingId) {
      cacheRef.current = { bookingId, value: loadBookingDraft(bookingId) }
    }
    return cacheRef.current.value
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

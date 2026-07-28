'use client'

import { useEffect, useState } from 'react'

/**
 * Delays committing `value` until `delayMs` have passed without it
 * changing again. Used by the attraction-ticket search box so autocomplete
 * doesn't re-filter on every keystroke — the input itself stays
 * synchronous (never debounced), only the derived suggestion list is.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

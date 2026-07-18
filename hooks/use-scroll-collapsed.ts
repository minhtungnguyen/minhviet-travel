'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks whether the page has scrolled past `threshold`. Used by the
 * header to switch to its compact state — the persistent contact
 * affordance and skip target are unaffected by this state, unlike the
 * previous header where the utility bar (and its only phone number)
 * disappeared entirely on scroll.
 */
export function useScrollCollapsed(threshold = 20): boolean {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return collapsed
}

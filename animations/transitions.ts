import type { Transition } from 'framer-motion'
import { DURATION, EASE } from '@/constants/motion'

function buildTransition(duration: number): Transition {
  return { duration, ease: EASE }
}

export const transitions = {
  fast: buildTransition(DURATION.fast),
  standard: buildTransition(DURATION.standard),
  slow: buildTransition(DURATION.slow),
} as const

/**
 * Returns an instant, motion-free transition when the visitor has
 * requested reduced motion — callers pass this instead of branching on
 * `prefersReducedMotion` at every call site.
 */
export function safeTransition(transition: Transition, prefersReducedMotion: boolean): Transition {
  return prefersReducedMotion ? { duration: 0 } : transition
}

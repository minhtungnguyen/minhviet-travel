'use client'

import { useReducedMotion } from 'framer-motion'

/**
 * Thin wrapper around Framer Motion's `useReducedMotion` that returns a
 * definite boolean during SSR/first paint instead of `null`, so callers
 * can use it directly as a variant argument without a null check.
 */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false
}

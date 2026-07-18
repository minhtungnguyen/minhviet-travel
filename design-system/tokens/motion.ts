/**
 * Motion Tokens — subtle, Linear-inspired.
 * Rule: no bounce, no spring, no scale/zoom transforms on interactive
 * elements. Motion communicates state change, never decoration.
 */

export const duration = {
  instant: '100ms',
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '400ms',
} as const

export const easing = {
  /** Default for most UI transitions (color, background, border, opacity). */
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Entrances: panels, dropdowns, tooltips appearing. */
  decelerate: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Exits: panels, dropdowns, tooltips disappearing. */
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  linear: 'linear',
} as const

export const transition = {
  /** Default: color/background/border/opacity changes on hover, focus, active. */
  base: `${duration.base} ${easing.standard}`,
  fast: `${duration.fast} ${easing.standard}`,
  enter: `${duration.base} ${easing.decelerate}`,
  exit: `${duration.fast} ${easing.accelerate}`,
} as const

export const motion = { duration, easing, transition } as const

export type MotionTokens = typeof motion

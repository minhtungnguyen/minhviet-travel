export { duration, easing, transition, motion, type MotionTokens } from '../tokens/motion'

/**
 * Utility class reference (see ./motion.css):
 *   .ds-transition        — 200ms color/background/border/opacity (also in css/tokens.css)
 *   .ds-transition-fast   — 150ms variant
 *   .ds-fade-in           — opacity-only entrance
 *   .ds-slide-up-in       — opacity + 8px translate entrance
 *
 * There are intentionally no scale/zoom/bounce utilities in this system.
 */
export const motionClassNames = {
  transition: 'ds-transition',
  transitionFast: 'ds-transition-fast',
  fadeIn: 'ds-fade-in',
  slideUpIn: 'ds-slide-up-in',
} as const

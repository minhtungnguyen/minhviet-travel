import type { Variants } from 'framer-motion'
import { STAGGER_CHILD_DELAY, DURATION, EASE } from '@/constants/motion'

/**
 * Every variant here has a motion-safe branch built in — no component
 * needs to remember to disable it separately. This is the direct fix for
 * the audit finding that the old marquee animation silently ignored
 * `prefers-reduced-motion`.
 */
export function fadeUpVariants(prefersReducedMotion: boolean, delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: DURATION.slow, ease: EASE, delay },
    },
  }
}

export function staggerContainerVariants(prefersReducedMotion: boolean): Variants {
  return {
    hidden: {},
    visible: {
      transition: prefersReducedMotion
        ? { staggerChildren: 0 }
        : { staggerChildren: STAGGER_CHILD_DELAY },
    },
  }
}

export function scaleInVariants(prefersReducedMotion: boolean, delay = 0): Variants {
  return {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: DURATION.standard, ease: EASE, delay },
    },
  }
}

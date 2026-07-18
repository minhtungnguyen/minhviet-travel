/**
 * Mirrors the motion tokens in
 * volume/volume-02-design/tokens/design-tokens.json (fast/standard/slow)
 * and the easing curve already used in app/globals.css, so Framer Motion
 * timing stays visually consistent with the rest of the site instead of
 * introducing a fourth motion language.
 */
export const DURATION = {
  fast: 0.14,
  standard: 0.22,
  slow: 0.36,
} as const

export const EASE = [0.22, 1, 0.36, 1] as const

export const STAGGER_CHILD_DELAY = 0.08

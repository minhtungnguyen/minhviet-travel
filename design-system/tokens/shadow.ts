/**
 * Shadow Tokens — soft, diffused, neutral-tinted elevation.
 * Explicitly NOT Material Design elevation (no dark, high-contrast,
 * multi-directional layered shadows). Every tier uses the same neutral
 * graphite tint at low opacity with a large, gentle blur.
 */

export const shadow = {
  none: 'none',
  /** Resting surfaces: cards, inputs. */
  soft: '0 1px 2px rgba(16, 23, 42, 0.04), 0 2px 8px rgba(16, 23, 42, 0.04)',
  /** Raised surfaces: dropdowns, popovers, hovered cards. */
  medium: '0 4px 16px rgba(16, 23, 42, 0.06), 0 2px 4px rgba(16, 23, 42, 0.04)',
  /** Floating surfaces: modals, toasts, command palettes. */
  floating: '0 16px 48px rgba(16, 23, 42, 0.10), 0 4px 12px rgba(16, 23, 42, 0.06)',
} as const

export type ShadowTokens = typeof shadow

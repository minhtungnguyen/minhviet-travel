/**
 * Z-Index Tokens — a single authoritative stacking scale so overlays never
 * fight each other across products.
 */

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
} as const

export type ZIndexTokens = typeof zIndex

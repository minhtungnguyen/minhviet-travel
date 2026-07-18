export * from './colors'
export * from './typography'
export * from './spacing'
export * from './radius'
export * from './shadow'
export * from './motion'
export * from './z-index'
export * from './container'
export * from './breakpoints'

import { colors } from './colors'
import { typography } from './typography'
import { spacing, spacingAlias } from './spacing'
import { radius } from './radius'
import { shadow } from './shadow'
import { motion } from './motion'
import { zIndex } from './z-index'
import { container } from './container'
import { breakpoints } from './breakpoints'

/** Single import for consumers that want the whole token tree at once. */
export const tokens = {
  colors,
  typography,
  spacing,
  spacingAlias,
  radius,
  shadow,
  motion,
  zIndex,
  container,
  breakpoints,
} as const

export type DesignTokens = typeof tokens

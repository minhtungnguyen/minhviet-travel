/**
 * Spacing Tokens — 4px base unit.
 * Named aliases map 1:1 onto the required scale: 4,8,12,16,20,24,32,40,48,64,80,96,120,160.
 */

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  30: '120px',
  40: '160px',
} as const

export const spacingAlias = {
  xxs: spacing[1], // 4px
  xs: spacing[2], // 8px
  sm: spacing[3], // 12px
  md: spacing[4], // 16px
  base: spacing[5], // 20px
  lg: spacing[6], // 24px
  xl: spacing[8], // 32px
  '2xl': spacing[10], // 40px
  '3xl': spacing[12], // 48px
  '4xl': spacing[16], // 64px
  '5xl': spacing[20], // 80px
  '6xl': spacing[24], // 96px
  '7xl': spacing[30], // 120px
  '8xl': spacing[40], // 160px
} as const

export type SpacingTokens = typeof spacing

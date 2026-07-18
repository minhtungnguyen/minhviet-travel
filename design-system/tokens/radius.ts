/**
 * Radius Tokens — restrained, structural rounding. No pill-shaped default;
 * `full` exists only for avatars, dots, and circular icon buttons.
 */

export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const

export type RadiusTokens = typeof radius

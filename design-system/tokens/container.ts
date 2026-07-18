/**
 * Container Tokens — max-widths for page and section content wells.
 */

export const container = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
} as const

export type ContainerTokens = typeof container

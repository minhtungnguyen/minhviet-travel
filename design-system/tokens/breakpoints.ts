/**
 * Breakpoint Tokens — matches Tailwind's default scale so token-driven and
 * utility-class responsive logic never disagree.
 */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export type BreakpointTokens = typeof breakpoints

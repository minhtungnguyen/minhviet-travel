/**
 * Color Tokens — Minh Việt Digital Design System
 *
 * Philosophy: the product is a white, editorial-quiet canvas. Color is a tool
 * for hierarchy and function, not decoration. Enterprise Blue exists ONLY to
 * mark interactive affordances (links, focus, active controls) — never as a
 * page-wide background or brand wash. Champagne Bronze is a rare, premium
 * accent (badges, key numerals, one CTA per screen at most).
 *
 * Do not use the product logo color as the site's dominant color.
 */

export const neutral = {
  0: '#FFFFFF', // White — primary surface
  25: '#FAFAFB', // Soft White — page background
  50: '#F5F5F7',
  100: '#EDEEF0',
  150: '#E5E7EA',
  200: '#DBDDE1',
  300: '#C2C5CB',
  400: '#9CA0AB',
  500: '#71757F',
  600: '#52565F',
  700: '#3A3D45',
  800: '#24262B',
  900: '#16171B', // Graphite — primary text / ink
} as const

/** Enterprise Blue — reserved for interactive states only. */
export const blue = {
  50: '#EEF2FF',
  100: '#DCE4FF',
  200: '#B7C6FF',
  300: '#8DA3FF',
  400: '#5C7CFF',
  500: '#3358F2',
  600: '#2247E0', // DEFAULT interactive
  700: '#1B39B8',
  800: '#162E93',
  900: '#132872',
} as const

/** Champagne Bronze — premium accent, used sparingly. */
export const bronze = {
  50: '#FBF6EE',
  100: '#F3E7D2',
  200: '#E6CDA4',
  300: '#D6B27B',
  400: '#C39A5E',
  500: '#A9814F', // DEFAULT accent
  600: '#8C6B3E',
  700: '#6E5330',
  800: '#503C23',
  900: '#372A18',
} as const

export const success = { subtle: '#E8F5EE', default: '#1E8A5B', strong: '#146341' } as const
export const warning = { subtle: '#FFF4E5', default: '#B76E00', strong: '#8A5200' } as const
export const danger = { subtle: '#FDEDEC', default: '#C0362C', strong: '#8E2620' } as const

/**
 * Semantic roles. Components should consume `semantic`, not the raw scales
 * above — this is the layer that keeps the whole system reskinnable.
 */
export const semantic = {
  surface: {
    base: neutral[0],
    subtle: neutral[25],
    muted: neutral[50],
    inverse: neutral[900],
  },
  text: {
    primary: neutral[900],
    secondary: neutral[600],
    muted: neutral[500],
    disabled: neutral[300],
    inverse: neutral[0],
    onBronze: neutral[900],
    onInteractive: neutral[0],
  },
  border: {
    subtle: neutral[150],
    default: neutral[200],
    strong: neutral[300],
    focus: blue[600],
  },
  interactive: {
    default: blue[600],
    hover: blue[700],
    active: blue[800],
    subtle: blue[50],
    subtleHover: blue[100],
    border: blue[200],
    disabled: neutral[200],
  },
  accent: {
    default: bronze[500],
    hover: bronze[600],
    subtle: bronze[50],
    subtleBorder: bronze[200],
    text: bronze[700],
  },
  feedback: { success, warning, danger },
} as const

export const colors = { neutral, blue, bronze, success, warning, danger, semantic } as const

export type ColorTokens = typeof colors

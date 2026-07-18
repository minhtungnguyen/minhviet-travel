/**
 * Typography Tokens — Minh Việt Digital Design System
 *
 * Heading: Manrope. Body: Inter. Sizes are restrained and editorial —
 * closer to Stripe/Linear reference material than a marketing travel site.
 * `display` is a bonus tier above H1 for hero/marketing use; it is not one
 * of the required H1–H4 roles but is documented for product teams that need
 * a larger opening statement than H1 allows.
 */

export const fontFamily = {
  heading: 'var(--ds-font-heading), "Manrope", ui-sans-serif, system-ui, sans-serif',
  body: 'var(--ds-font-body), "Inter", ui-sans-serif, system-ui, sans-serif',
} as const

export type TypeStyle = {
  fontFamily: string
  fontSize: string
  lineHeight: string
  fontWeight: number
  letterSpacing?: string
  textTransform?: 'none' | 'uppercase'
}

export const typeScale: Record<
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bodyLarge'
  | 'body'
  | 'small'
  | 'caption'
  | 'button'
  | 'label',
  TypeStyle
> = {
  display: {
    fontFamily: fontFamily.heading,
    fontSize: '64px',
    lineHeight: '72px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  h1: {
    fontFamily: fontFamily.heading,
    fontSize: '48px',
    lineHeight: '56px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: fontFamily.heading,
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontFamily: fontFamily.heading,
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: fontFamily.heading,
    fontSize: '22px',
    lineHeight: '30px',
    fontWeight: 600,
    letterSpacing: '0em',
  },
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: '16px',
    lineHeight: '26px',
    fontWeight: 400,
  },
  small: {
    fontFamily: fontFamily.body,
    fontSize: '14px',
    lineHeight: '22px',
    fontWeight: 400,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  button: {
    fontFamily: fontFamily.body,
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
}

export const typography = { fontFamily, typeScale } as const

export type TypographyTokens = typeof typography

# Roadmap

## Phase 1 — Foundation (this pass)

- [x] Design tokens: color, typography, spacing, radius, shadow, motion,
      z-index, container, breakpoints (`design-system/tokens/`).
- [x] Isolated, additive Tailwind theme layer (`design-system/css/tokens.css`).
- [x] Button System (primary, secondary, ghost, text, danger, premium,
      loading, disabled).
- [x] Input System (text, textarea, search, dropdown, date, phone, OTP,
      upload).
- [x] Card System (tour, destination, service, partner, news, AI,
      dashboard).
- [x] Layout System (container, grid, section, page shell, sidebar, header,
      footer).
- [x] Motion System (200ms, no bounce/zoom, two entrance utilities).
- [x] Documentation.

Zero visual change to any existing route in this repo.

## Phase 2 — Homepage adoption (not started, needs explicit sign-off)

Re-skin the current Minh Việt Travel homepage and interior routes to
consume `design-system` tokens/components instead of the navy/champagne-gold
system built in the prior UI Refinement Sprint. This is a full visual
change to a live, previously-approved design and should be scoped and
approved as its own sprint — it is not implied by "build the foundation."

Candidate order of operations:

1. Swap `app/layout.tsx` fonts to Manrope + Inter, wire `--ds-manrope` /
   `--ds-inter`.
2. Replace `components/mv/mv-button.tsx` call sites with
   `design-system/components/button`.
3. Replace `components/site/site-header.tsx` / `site-footer.tsx` with
   `design-system/components/layout` primitives.
4. Replace tour/destination/service card markup with the new Card System.
5. Retire `--primary` / `--accent` / `--gold` / `--navy` / `--deep` from
   `app/globals.css` once nothing references them.

## Phase 3 — Second product

Stand up MIVIGO, Minh Việt Booking, or Checkin Platform directly on
`design-system` from day one — no legacy tokens to migrate away from.

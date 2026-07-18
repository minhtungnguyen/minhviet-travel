# Minh Việt Digital Design System

A shared design foundation for Minh Việt Travel, MIVIGO, Minh Việt Booking,
Checkin Platform, and future AI products.

## Status

**Phase 1 — Foundation.** This folder contains tokens, primitive
components, and documentation only. **Nothing in `/design-system` is wired
into the current Minh Việt Travel homepage or any existing route.** The
live site is unchanged — same navy/champagne-gold marketing look it had
before this work started. Applying this system to an existing product is a
deliberate, separate, future step (see "Adopting this system" below).

## Design philosophy

Forget OTA aesthetics — Traveloka, Booking.com, Klook. This system is built
to feel like a premium enterprise software product: **Apple, Stripe,
Linear, Notion, Mercedes and Four Seasons Digital** are the reference
points, not travel agencies.

The emotional target: **trust, professional, elegant, modern, technological,
premium.**

Three rules fall directly out of that:

1. **The canvas is white.** Soft White / White is the dominant surface.
   Color is used for hierarchy and function, never as a wash.
2. **Blue is interactive, not decorative.** Enterprise Blue marks the one
   thing on a screen you can act on — a link, a focused field, a primary
   button. It is never a background fill, a section color, or a brand wash.
3. **Bronze is rare.** Champagne Bronze exists for a small number of
   deliberately premium moments (a badge, a key metric, a single upgrade
   CTA) — never for anything printed more than once or twice per screen.
4. **The product's own logo color is not the site's color.** Brand marks
   live in the logo; the interface itself stays neutral so it can host any
   of Minh Việt's product lines without reskinning.

## Folder map

```
design-system/
├── tokens/            Typed token source of truth (colors, typography,
│                       spacing, radius, shadow, motion, z-index, container,
│                       breakpoints). Import these directly in TS/JS for any
│                       non-Tailwind context (charts, inline styles, motion
│                       configs).
├── css/
│   └── tokens.css      Tailwind v4 theme extension generated from the token
│                       files above, namespaced `ds-` so it cannot collide
│                       with (or change the look of) the existing site theme
│                       in app/globals.css. Produces utilities like
│                       `bg-ds-neutral-25`, `text-ds-blue-600`,
│                       `shadow-ds-floating`, `rounded-ds-lg`.
├── motion/            Motion tokens + the two allowed entrance animations
│                       (fade-in, slide-up-in) as opt-in utility classes.
├── components/
│   ├── button/         Button — 6 variants, loading + disabled states.
│   ├── input/           TextInput, Textarea, SearchInput, Select, DateInput,
│                       PhoneInput, OtpInput, UploadInput.
│   ├── card/            TourCard, DestinationCard, ServiceCard, PartnerCard,
│                       NewsCard, AICard, DashboardCard.
│   └── layout/          Container, Grid, Section, PageShell, Sidebar,
│                       Header, Footer.
└── docs/               Longer-form usage notes per system (see below).
```

Every component folder has an `index.ts` barrel — import from the folder,
not the individual file:

```ts
import { Button } from '@/design-system/components/button'
import { TextInput, Select } from '@/design-system/components/input'
import { TourCard, DashboardCard } from '@/design-system/components/card'
import { Container, Section, Grid } from '@/design-system/components/layout'
import { tokens } from '@/design-system/tokens'
```

## How the token layer works

Tailwind v4 is CSS-first: theme values are declared with `@theme` blocks and
turned into utility classes automatically. `design-system/css/tokens.css`
declares a full `ds`-prefixed theme extension and is imported once,
additively, at the top of `app/globals.css`:

```css
@import '../design-system/css/tokens.css';
```

That import adds new utility classes to the Tailwind build. It does **not**
touch any of the existing `--primary` / `--accent` / `--gold` / `--radius`
variables the live site already uses, so every current page renders
byte-for-byte the same as before this system existed.

Not every token category is wired into `@theme`:

| Category      | Where it lives                                   |
| -------------- | ------------------------------------------------- |
| Color          | `@theme` → `bg-ds-*`, `text-ds-*`, `border-ds-*`  |
| Typography     | `@theme` → `font-ds-heading`, `font-ds-body`      |
| Radius         | `@theme` → `rounded-ds-*`                         |
| Shadow         | `@theme` → `shadow-ds-*`                          |
| Breakpoints    | `@theme` → responsive variants (`ds-sm:`, etc.)   |
| Spacing        | **Not remapped.** Tailwind's native 4px scale already matches the required 4/8/12/16/20/24/32/40/48/64/80/96/120/160 scale — use `p-5`, `gap-6`, `py-30`, etc. directly. |
| Z-index        | TS only (`tokens.zIndex`) — apply as `style={{ zIndex }}` or an arbitrary value class, since z-index scales are consumed programmatically far more often than as static classes. |
| Container      | TS only (`tokens.container`) and the `Container` layout component. |

## Typography

Heading font is **Manrope**, body font is **Inter**. Neither is loaded by
the current app yet (the live site still ships its own font stack — see
Phase 1 status above). When a product adopts this system, load both via
`next/font/google` and expose them as `--ds-manrope` / `--ds-inter` CSS
variables on `<html>`:

```tsx
import { Manrope, Inter } from 'next/font/google'

const manrope = Manrope({ subsets: ['latin', 'vietnamese'], weight: ['500', '600', '700', '800'], variable: '--ds-manrope' })
const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--ds-inter' })
```

`font-ds-heading` / `font-ds-body` fall back to the literal family names, so
components render correctly even before that wiring exists.

## Motion

200ms default, `cubic-bezier(0.4,0,0.2,1)` easing, no bounce, no spring, no
scale/zoom on interactive elements. See `design-system/motion/motion.css`.

## Adopting this system on an existing product

1. Import `design-system/css/tokens.css` into that product's global
   stylesheet (already done for this repo).
2. Load Manrope + Inter and expose `--ds-manrope` / `--ds-inter`.
3. Swap page components for the `design-system/components/*` primitives one
   section at a time — each one is a drop-in replacement, not a rewrite.
4. Retire the product's legacy tokens once nothing references them.

For **this repo specifically**, step 3–4 (reskinning the Minh Việt Travel
homepage) is intentionally out of scope for this pass — see
`docs/roadmap.md`.

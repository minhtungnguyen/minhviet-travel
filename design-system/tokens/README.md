# Tokens

Typed source of truth. Import from `@/design-system/tokens` (barrel) or the
individual file. Every value here is also mirrored into
`design-system/css/tokens.css` as a `ds`-prefixed Tailwind utility where a
Tailwind theme namespace exists for it (see the root README's mapping
table).

## Color

Three roles, used in this proportion — this is the whole color philosophy
in one paragraph:

- **Neutral (White → Graphite)** — ~90% of every screen. Surfaces, text,
  borders, dividers.
- **Enterprise Blue** — interactive elements only: links, primary buttons,
  focus rings, active nav state, form field focus. Never a section
  background or brand wash.
- **Champagne Bronze** — a rare premium accent. One badge, one key metric,
  one upgrade CTA. Not a secondary brand color to sprinkle everywhere.

| Scale    | 0/50 | 500 (mid) | 900 (deep) |
| -------- | ---- | --------- | ---------- |
| neutral  | `#FFFFFF` | `#71757F` | `#16171B` |
| blue     | `#EEF2FF` | `#3358F2` | `#132872` |
| bronze   | `#FBF6EE` | `#A9814F` | `#372A18` |

Semantic roles (`colors.semantic`) are what components should actually
consume — `semantic.text.primary`, `semantic.interactive.default`,
`semantic.accent.default`, etc. — so the raw scales can evolve without
touching component code.

## Typography

Heading: **Manrope**. Body: **Inter**.

| Role       | Size / Line-height | Weight | Notes                    |
| ---------- | ------------------- | ------ | ------------------------- |
| display    | 64 / 72              | 800    | Marketing hero, optional  |
| h1         | 48 / 56              | 700    |                            |
| h2         | 36 / 44              | 700    |                            |
| h3         | 28 / 36              | 600    |                            |
| h4         | 22 / 30              | 600    |                            |
| bodyLarge  | 18 / 28              | 400    |                            |
| body       | 16 / 26              | 400    | Default paragraph         |
| small      | 14 / 22              | 400    |                            |
| caption    | 12 / 18              | 500    | +0.02em tracking           |
| button     | 14 / 20              | 600    | +0.01em tracking           |
| label      | 13 / 18              | 600    | Uppercase, +0.04em tracking |

## Spacing

4px base unit: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120, 160`.
This is Tailwind's native scale — use `p-*`, `gap-*`, `py-*` etc. directly;
`spacingAlias` in `spacing.ts` gives named handles (`xs`, `md`, `2xl`, ...)
for non-Tailwind contexts.

## Radius

`sm 4 · md 8 · lg 12 · xl 16 · 2xl 24 · 3xl 32 · full 9999`

## Shadow

Soft, neutral-tinted, large-blur elevation. Explicitly not Material Design
elevation (no dark, tight, multi-directional shadows).

- `soft` — resting cards, inputs
- `medium` — hovered cards, dropdowns, popovers
- `floating` — modals, toasts, command palettes

## Motion

200ms default (`duration.base`), `cubic-bezier(0.4,0,0.2,1)` standard
easing. No bounce, no spring, no scale/zoom transforms. See
`design-system/motion/`.

## Z-index

`base 0 · dropdown 1000 · sticky 1100 · fixed 1200 · overlay 1300 · modal 1400 · popover 1500 · toast 1600 · tooltip 1700`

## Container / Breakpoints

Container: `xs 480 · sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440`
Breakpoints mirror Tailwind's defaults: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.

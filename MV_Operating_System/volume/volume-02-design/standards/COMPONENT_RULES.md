# Component Rules

## General

- Use semantic names and tokens.
- Components must support real content and all material states.
- Prefer composition over one-off duplication.
- Keep domain logic outside low-level visual primitives.
- Use accessible primitives for dialog, menu, tabs, select and tooltip.
- Every interactive component requires keyboard and focus behavior.

## Required component documentation

- Purpose
- Props
- Variants
- States
- Responsive behavior
- Accessibility
- Content constraints
- Analytics event
- Example
- Owner

## Forbidden

- Raw repeated hex values in components
- Arbitrary spacing when a token exists
- Clickable `div` without semantic behavior
- Placeholder-only labels
- Destructive action without clear confirmation
- Fake loading progress
- Component variants created solely for one page without review

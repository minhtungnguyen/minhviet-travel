/**
 * Shared card chrome: white surface, subtle border, soft resting shadow,
 * medium shadow on hover. No scale/translate on hover — motion stays
 * confined to shadow/border per the system's "no bounce, no zoom" rule.
 */
export const cardBaseClass =
  'ds-transition group flex flex-col overflow-hidden rounded-ds-xl border border-ds-border-subtle bg-ds-surface-base shadow-ds-soft hover:border-ds-border-default hover:shadow-ds-medium'

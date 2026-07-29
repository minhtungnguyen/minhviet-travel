/**
 * Static in-memory catalog for `MockAttractionTicketProvider`. NOT test
 * fixtures (those live under `integrations/attraction-ticket/fixtures/`
 * once Phase 3 adds them for OneInventory response-shape tests) — this is
 * UI/demo data for Phase 2, kept separate so the two purposes never get
 * confused (brief §I.12 "không để mock data lẫn vào Production" — this
 * file is only ever imported by `mock-provider.ts`, which is only ever
 * selected when `ONEINVENTORY_ENABLED` is unset/false).
 */

export type MockVariant = {
  providerVariantId: string
  /**
   * NOT part of `ProviderIdMapping`/`TicketAvailability` (neither has a
   * display-name field — a real gap in the current contract, since the
   * missing OneAPI field-level spec means it's unknown what field a real
   * provider would use for this — docs/mv-ticket/09-open-questions.md #1,
   * flagged for the contract-extension request in
   * docs/mv-ticket/02-system-architecture.md §5). `label` is looked up
   * client-side from `getMockVariantLabel()` below, only ever for the mock
   * provider — never presented as if it came from a real API response.
   */
  label: string
  /** VND, matching the currency check constraint on attraction_products. */
  price: number
  currency: 'VND'
  /** null = provider reports no stock limit; a number simulates a real cap. */
  remaining: number | null
}

export const MOCK_VARIANTS: MockVariant[] = [
  { providerVariantId: 'mock-variant-adult', label: 'Vé người lớn', price: 890_000, currency: 'VND', remaining: 50 },
  { providerVariantId: 'mock-variant-child', label: 'Vé trẻ em (1m - 1m4)', price: 590_000, currency: 'VND', remaining: 50 },
  // Deterministic out-of-stock fixture for exercising the "hết vé" UI state
  // (brief §XIV E2E list explicitly requires an out-of-stock scenario).
  { providerVariantId: 'mock-variant-soldout', label: 'Vé ưu đãi (demo hết chỗ)', price: 750_000, currency: 'VND', remaining: 0 },
]

export function findMockVariant(providerVariantId: string): MockVariant | undefined {
  return MOCK_VARIANTS.find((v) => v.providerVariantId === providerVariantId)
}

/** UI-only label lookup — see the `label` field comment above for why this isn't part of the provider contract itself. */
export function getMockVariantLabel(providerVariantId: string): string {
  return findMockVariant(providerVariantId)?.label ?? 'Loại vé'
}

import { MockAttractionTicketProvider } from '@/integrations/attraction-ticket/providers/mock-provider'
import type { AttractionTicketProvider } from '@/integrations/attraction-ticket/contracts/attraction-ticket-provider'

/**
 * Single seam every route/service uses to obtain a provider — never
 * `new MockAttractionTicketProvider()` or a future `new
 * OneInventoryProvider()` directly outside this file, so switching
 * providers is a one-line change here, not a find-and-replace across the
 * codebase (docs/mv-ticket/02-system-architecture.md §4 "Feature flag").
 *
 * Phase 1: always returns the mock. Phase 3 adds:
 *   const enabled = getOneInventoryEnv().ONEINVENTORY_ENABLED
 *   return enabled ? new OneInventoryProvider(...) : new MockAttractionTicketProvider()
 * — not implemented yet because `OneInventoryProvider` doesn't exist yet
 * (blocked on the missing field-level API spec, see
 * docs/mv-ticket/09-open-questions.md #1). No `ONEINVENTORY_ENABLED` read
 * happens here yet either, on purpose: reading it now while it's always
 * false would be a no-op that just adds a misleading branch.
 */
export function getAttractionTicketProvider(): AttractionTicketProvider {
  return new MockAttractionTicketProvider()
}

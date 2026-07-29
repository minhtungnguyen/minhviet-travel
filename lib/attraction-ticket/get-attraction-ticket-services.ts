import 'server-only'
import { cache } from 'react'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { getAdminSupabaseClient } from '@/shared/supabase/admin-client'
import { recordAuditLog } from '@/modules/audit/application/audit.service'
import { SupabaseAttractionTicketRepository } from '@/modules/attraction-ticket/infrastructure/attraction-ticket.repository'
import { AttractionCatalogService } from '@/modules/attraction-ticket/application/attraction-catalog.service'
import { AttractionBookingService } from '@/modules/attraction-ticket/application/attraction-booking.service'
import { getAttractionTicketProvider } from '@/integrations/attraction-ticket/providers/get-provider'
import { SupabaseMasterDataRepository } from '@/modules/master-data/infrastructure/master-data.repository'
import { MasterDataService } from '@/modules/master-data/application/master-data.service'

/**
 * The seam every `app/ve-vui-choi/**` page and `app/api/v1/attraction-
 * tickets/**` route calls into — mirrors `getServerSupabaseClient()` +
 * `new XService(new SupabaseXRepository(client), ...)` already used by
 * every other module's route handler (e.g. `app/api/v1/organizations/
 * route.ts`), just wrapped once so pages don't repeat the boilerplate.
 *
 * `cache()` (React's per-request memoization, not a data cache) so a
 * single page render that calls this more than once reuses the same
 * Supabase client instead of creating a fresh one per call — same pattern
 * as `lib/flight/flight-repository.ts#getFlightHomeContent`.
 */
export const getCatalogService = cache(async () => {
  const client = await getServerSupabaseClient()
  return new AttractionCatalogService(new SupabaseAttractionTicketRepository(client), client, recordAuditLog, getAttractionTicketProvider())
})

/**
 * `AttractionVenue.destinationId` is a raw FK — this module's repository
 * never queries `destinations` directly (module-boundaries.md), so any
 * page needing the destination's display name/slug composes it here, via
 * `master-data`'s own service, not by reaching into its table.
 */
export const getMasterDataService = cache(async () => {
  const client = await getServerSupabaseClient()
  return new MasterDataService(new SupabaseMasterDataRepository(client), recordAuditLog)
})

/**
 * Guest checkout / guest booking lookup — service-role client, no
 * `resolveActor()` (docs/mv-ticket §"guest checkout"). NEVER used for
 * catalog reads (those stay on the session client above, RLS-gated to
 * `status = 'ACTIVE'` rows only) — only for the two operations RLS
 * structurally cannot express for an anonymous caller: creating an order,
 * and looking one up by order_code + email.
 */
export function getGuestBookingService() {
  const admin = getAdminSupabaseClient()
  return new AttractionBookingService(new SupabaseAttractionTicketRepository(admin), recordAuditLog, getAttractionTicketProvider())
}

import 'server-only'
import { getMockVariantLabel } from '@/integrations/attraction-ticket/providers/mock-data'
import { getAttractionTicketProvider } from '@/integrations/attraction-ticket/providers/get-provider'
import type { ProviderIdMapping } from '@/integrations/attraction-ticket/contracts/attraction-ticket-provider'

export type AttractionVariantOption = {
  providerVariantId: string
  label: string
  price: number
  currency: string
  remaining: number | null
}

/**
 * Server-side composition: `listProductVariantOptions` (catalog service)
 * returns raw `ProviderIdMapping[]` (id-mapping only, no price/label) —
 * this resolves each into a booking-panel-ready option by calling
 * `searchAvailability` for a representative date and attaching a display
 * label. The label lookup is mock-only (see mock-data.ts's comment on why
 * that's not part of the provider contract) — kept in this one
 * composition point so no UI component needs to know the provider is
 * currently the mock.
 */
export async function buildVariantOptions(mappings: ProviderIdMapping[], referenceDate: string): Promise<AttractionVariantOption[]> {
  const provider = getAttractionTicketProvider()
  const options = await Promise.all(
    mappings
      .filter((m): m is ProviderIdMapping & { providerVariantId: string } => Boolean(m.providerVariantId))
      .map(async (mapping) => {
        const availability = await provider.searchAvailability(mapping.providerVariantId, referenceDate)
        return {
          providerVariantId: mapping.providerVariantId,
          label: getMockVariantLabel(mapping.providerVariantId),
          price: availability.price,
          currency: availability.currency,
          remaining: availability.remaining,
        }
      }),
  )
  return options
}

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { getAttractionTicketProvider } from '@/integrations/attraction-ticket/providers/get-provider'

/**
 * Public — re-checks price/stock for a specific ticket variant + date
 * (brief §XI booking flow step 4: "Hệ thống kiểm tra lại khả dụng"), called
 * from the product detail page's booking panel whenever the customer
 * changes date/ticket type, before enabling checkout. No `resolveActor()`
 * — this is read-only, provider-sourced data, never Minh Việt's own DB.
 */
const availabilityQuerySchema = z.object({
  providerVariantId: z.string().min(1),
  date: z.string().date(),
})

export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = availabilityQuerySchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid availability request', { issues: parsed.error.issues })

  const provider = getAttractionTicketProvider()
  const availability = await provider.searchAvailability(parsed.data.providerVariantId, parsed.data.date)
  return ok(availability, requestId)
})

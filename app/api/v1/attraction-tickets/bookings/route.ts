import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { attractionCheckoutCreateSchema } from '@/modules/attraction-ticket/schemas/attraction-ticket.schema'
import { getGuestBookingService } from '@/lib/attraction-ticket/get-attraction-ticket-services'

/**
 * Public guest checkout — no `resolveActor()`, same shape as the public
 * form-submission route (`app/api/v1/public/sites/[websiteKey]/forms/
 * [formKey]/submissions/route.ts`): Zod validation runs first, then a
 * service-role-backed service does the write (`attraction_orders` has no
 * anon INSERT policy — database/policies/0004_attraction_ticket_policies.sql).
 * Idempotent via `AttractionBookingService#createGuestBooking`.
 */
export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = attractionCheckoutCreateSchema.safeParse(body)
  if (!parsed.success) throw AppError.validation('Invalid booking payload', { issues: parsed.error.issues })

  const service = getGuestBookingService()
  const result = await service.createGuestBooking(parsed.data.websiteId, parsed.data, requestId)
  return ok(result, requestId)
})

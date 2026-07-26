import { NextRequest } from 'next/server'
import { AppError } from '@/shared/errors/app-error'
import { fail } from '@/shared/http/response'
import { newRequestId } from '@/shared/http/request-id'

/**
 * Every /api/v1/* route handler wraps its body in this instead of its
 * own try/catch, so the error envelope (docs/api/api-conventions.md) and
 * request-id logging are identical across every route. An unexpected
 * (non-AppError) exception is logged with its real message server-side
 * but only ever returns a generic INTERNAL_ERROR to the client —
 * master-prompt §13: "Do not expose stack traces or internal database
 * errors to clients."
 */
export function withRoute(
  handler: (req: NextRequest, requestId: string) => Promise<Response>,
) {
  return async (req: NextRequest): Promise<Response> => {
    const requestId = newRequestId()
    try {
      return await handler(req, requestId)
    } catch (error) {
      if (error instanceof AppError) {
        return fail(error, requestId)
      }
      console.error(`[${requestId}] Unhandled route error:`, error)
      return fail(new AppError('INTERNAL_ERROR', 'Something went wrong. Please try again.'), requestId)
    }
  }
}

/**
 * Same contract as `withRoute`, for a Next.js App Router dynamic-segment
 * handler (`(req, { params })` instead of `(req)`). Promoted out of
 * per-route try/catch duplication once a third `[id]` route needed it
 * (see the comment this replaced in app/api/v1/organizations/[id]/route.ts)
 * — Sprint 1B.2 adds many more of these.
 */
export function withParamsRoute<P extends Record<string, string>>(
  handler: (req: NextRequest, params: P, requestId: string) => Promise<Response>,
) {
  return async (req: NextRequest, context: { params: Promise<P> }): Promise<Response> => {
    const requestId = newRequestId()
    try {
      const params = await context.params
      return await handler(req, params, requestId)
    } catch (error) {
      if (error instanceof AppError) {
        return fail(error, requestId)
      }
      console.error(`[${requestId}] Unhandled route error:`, error)
      return fail(new AppError('INTERNAL_ERROR', 'Something went wrong. Please try again.'), requestId)
    }
  }
}

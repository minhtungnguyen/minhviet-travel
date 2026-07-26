import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { passwordResetRequestSchema } from '@/shared/auth/auth.schema'
import { logger } from '@/shared/logging/logger'

/**
 * Public endpoint — no `resolveActor()` call, this is how a signed-out
 * user starts a reset. Always returns the same success response whether
 * or not the email is registered (do not leak account existence).
 */
export const POST = withRoute(async (req: NextRequest, requestId) => {
  const body = await req.json()
  const parsed = passwordResetRequestSchema.safeParse(body)
  if (!parsed.success) {
    throw AppError.validation('Invalid password reset payload', { issues: parsed.error.issues })
  }

  const supabase = await getServerSupabaseClient()
  const redirectTo = `${process.env.APP_URL ?? 'http://localhost:3000'}/auth/password-update`
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo })
  // Logged server-side only, never reflected in the response — a
  // different response for a bad/unregistered email would leak account
  // existence (master-prompt §12).
  if (error) {
    logger.warn(requestId, 'resetPasswordForEmail returned an error', { error: error.message })
  }

  return ok({ sent: true }, requestId)
})

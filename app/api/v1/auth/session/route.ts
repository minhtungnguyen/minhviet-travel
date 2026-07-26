import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'

/**
 * Unlike every other protected route, "am I logged in" isn't itself an
 * error case — this never throws UNAUTHENTICATED, it just reports
 * `authenticated: false`. Use GET /auth/me if you need the full actor
 * (and want a real 401 when there's no session).
 */
export const GET = withRoute(async (_req: NextRequest, requestId) => {
  const supabase = await getServerSupabaseClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    return ok({ authenticated: false }, requestId)
  }
  return ok(
    {
      authenticated: true,
      userId: data.user.id,
      email: data.user.email,
      emailConfirmedAt: data.user.email_confirmed_at ?? null,
    },
    requestId,
  )
})

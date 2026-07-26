import type { NextRequest } from 'next/server'
import { withRoute } from '@/shared/http/handle-route'
import { ok } from '@/shared/http/response'
import { AppError } from '@/shared/errors/app-error'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'

export const POST = withRoute(async (_req: NextRequest, requestId) => {
  const supabase = await getServerSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new AppError('INTERNAL_ERROR', 'Failed to sign out')
  }
  return ok({ loggedOut: true }, requestId)
})

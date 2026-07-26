import type { NextRequest } from 'next/server'
import { updateSupabaseSession } from '@/shared/supabase/proxy-client'

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request)
}

export const config = {
  matcher: [
    /*
     * Skip static assets and image optimization files — matches the
     * standard @supabase/ssr Next.js middleware matcher recommendation.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

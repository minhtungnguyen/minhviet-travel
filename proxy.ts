import { NextResponse, type NextRequest } from 'next/server'
import { updateSupabaseSession } from '@/shared/supabase/proxy-client'
import { safeRedirectPath } from '@/shared/http/safe-redirect'

const PROTECTED_PREFIX = '/admin'

/**
 * `/admin/**` gate: unauthenticated (including a session whose refresh
 * token has itself expired — `updateSupabaseSession` already attempted
 * the refresh above, so `user === null` here means it's really gone) is
 * redirected to `/login` with `next` set to the original path (whitelisted
 * on the way back in by the same `safeRedirectPath` used everywhere else)
 * and `expired=1` so the login page can show "session expired" instead of
 * a generic message. This is presence-of-session only — which *permission*
 * a given `/admin` page needs is checked server-side by that page/action,
 * never inferred here (docs/backend/auth/02-auth-architecture.md §5).
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith(PROTECTED_PREFIX) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', safeRedirectPath(pathname, PROTECTED_PREFIX))
    url.searchParams.set('expired', '1')
    return NextResponse.redirect(url)
  }

  return response
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

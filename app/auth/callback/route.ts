import { NextResponse, type NextRequest } from 'next/server'
import { getServerSupabaseClient } from '@/shared/supabase/server-client'
import { safeRedirectPath } from '@/shared/http/safe-redirect'

/**
 * PKCE code-exchange landing point for every Supabase Auth email link
 * (password recovery today; invite/magic-link reuse the same route
 * later) — `@supabase/ssr` defaults to the PKCE flow, so the email link
 * carries `?code=...` that must be exchanged for a session *before* the
 * destination page can read one (docs/backend/auth/02-auth-architecture.md
 * §4). Centralizing the exchange here means no page has to duplicate it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'), '/reset-password')

  if (code) {
    const supabase = await getServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=link_expired', origin))
}

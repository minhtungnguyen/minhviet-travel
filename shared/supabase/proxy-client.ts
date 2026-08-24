import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/shared/supabase/database.types'
import { getPublicEnv } from '@/shared/env'

/**
 * Refreshes the Supabase session cookie on every navigation, called from
 * `proxy.ts` (Next.js 16's renamed `middleware.ts` convention) per
 * `@supabase/ssr`'s documented pattern — without this,
 * `getServerSupabaseClient()` in a Server Component can read a stale/
 * expired session (Server Components can't write cookies themselves).
 *
 * Also returns the resolved user (or `null`) so `proxy.ts` can gate
 * `/admin/**` without creating a second Supabase client — `getUser()` is
 * already called here to refresh the token, no need to call it twice.
 */
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const env = getPublicEnv()

  const supabase = createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Touches the session so an expired token is refreshed before any
  // downstream Server Component/Route Handler reads it. Guarded: this runs
  // on every request through `proxy.ts`'s matcher (nearly the whole site),
  // so a transient Supabase Auth outage must degrade to "no session"
  // instead of crashing every route.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  return { response, user }
}

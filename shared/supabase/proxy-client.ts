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
  // downstream Server Component/Route Handler reads it.
  await supabase.auth.getUser()

  return response
}

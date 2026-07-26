import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/shared/supabase/database.types'
import { getPublicEnv } from '@/shared/env'

/**
 * Session-bound Supabase client for Server Components and Route Handlers —
 * every ordinary authenticated operation goes through this, not the admin
 * client (docs/security/security-model.md: "prefer user-session + RLS").
 * `import 'server-only'` fails the build if a client component ever
 * imports this file.
 *
 * Async because `next/headers#cookies()` is async as of Next.js 15+; every
 * caller in this codebase awaits it (see each module's application-layer usage).
 */
export async function getServerSupabaseClient() {
  const env = getPublicEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component render — safe to ignore because
          // middleware.ts refreshes the session on every navigation.
        }
      },
    },
  })
}

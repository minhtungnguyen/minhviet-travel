import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/supabase/database.types'
import { getPublicEnv } from '@/shared/env'

/**
 * Anon-key client for genuinely public, anonymous-visitor reads
 * (homepage content, site footer, active announcement) from Server
 * Components that render on otherwise-static marketing pages.
 *
 * Deliberately does NOT go through `@supabase/ssr`/`next/headers#cookies()`
 * like `getServerSupabaseClient()` does — calling `cookies()` is itself
 * what forces Next.js to mark a route as dynamic (server-rendered per
 * request), even when the data fetched never depends on the visitor's
 * session. Sprint 2 discovered this the hard way: wiring `SiteFooter`/
 * `getHomepageContent()` through the cookie-bound client flipped nearly
 * every marketing page from static to dynamic, since `SiteChrome`
 * (and therefore `SiteFooter`) renders on almost all of them.
 *
 * RLS-equivalent to an anonymous cookie-less request either way — a
 * cookie-bound client with no active session resolves to the exact same
 * Postgres `anon` role. This client is simply the version that doesn't
 * touch `next/headers`, so pages using only public/anon-visible data
 * (RLS already enforces that boundary) can still be statically optimized.
 *
 * Never use this for anything requiring a real user session or write
 * access — `getServerSupabaseClient()` remains the client for that.
 */
export function getPublicSupabaseClient() {
  const env = getPublicEnv()
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

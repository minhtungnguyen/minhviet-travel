import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/shared/supabase/database.types'
import { getPublicEnv } from '@/shared/env'

/**
 * The only Supabase client allowed in client components. Anon key only —
 * RLS is the sole access-control layer for anything created through this
 * client (docs/security/security-model.md).
 */
export function getBrowserSupabaseClient() {
  const env = getPublicEnv()
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

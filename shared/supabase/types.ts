import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Generated from the live `mv-travel-os-dev` schema (Sprint 1B.2):
 *   supabase gen types typescript --project-id otusjahkdjpxqayeeqqn > shared/supabase/database.types.ts
 * Re-run this whenever a migration changes the schema — never hand-edit
 * `database.types.ts`.
 */
export type { Database } from '@/shared/supabase/database.types'
import type { Database } from '@/shared/supabase/database.types'

/**
 * Real Supabase client type every repository constructor now takes.
 * Replaces the Sprint 1A `SupabaseClientLike = unknown` placeholder —
 * no repository method signature changes, only this type's definition.
 */
export type SupabaseClientLike = SupabaseClient<Database>

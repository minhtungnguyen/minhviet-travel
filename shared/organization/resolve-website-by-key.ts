import type { SupabaseClientLike } from '@/shared/supabase/types'
import { AppError } from '@/shared/errors/app-error'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'

/**
 * Public content endpoints (`/api/v1/public/sites/{websiteKey}/...`)
 * address a website by its domain, not its internal uuid — the domain
 * is the one identifier a public caller can actually know. Shared
 * across CMS/navigation/FAQ/forms' public routes (4 callers).
 */
export async function resolveWebsiteByKey(
  client: SupabaseClientLike,
  websiteKey: string,
): Promise<{ id: string; status: string }> {
  const { data, error } = await client
    .from('websites')
    .select('id, status')
    .ilike('domain', websiteKey)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw mapDatabaseError(error, 'Website')
  if (!data) throw AppError.notFound('Website', websiteKey)
  return data
}

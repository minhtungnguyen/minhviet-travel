import type { SupabaseClientLike } from '@/shared/supabase/types'
import { AppError } from '@/shared/errors/app-error'
import { mapDatabaseError } from '@/shared/errors/db-error-mapper'

/**
 * Every content module (CMS, navigation, FAQ, SEO, forms, media) is
 * `website_id`-scoped, and every website belongs to an organization via
 * its brand. This one join is shared by all of them for the
 * `requireWebsiteAccess()` check (shared/auth/guards.ts) — extracted
 * here instead of duplicated per module once a fourth module needed it
 * (master-prompt §36 principle 19).
 *
 * This is also the seam that makes the platform genuinely multi-brand/
 * multi-website-ready today, not just schema-capable: nothing in any
 * content service hardcodes "the" website — every mutation resolves the
 * target website's owning organization and checks the actor's actual
 * access to it, so a second brand (e.g. a future MIVIGO or Checkin Cat
 * Ba website under the same or a different organization) needs zero
 * service-layer changes, only new `websites`/`brands` rows and, if it's
 * a genuinely separate organization, new `user_website_access` grants.
 */
export async function resolveWebsiteOrganizationId(client: SupabaseClientLike, websiteId: string): Promise<string> {
  const { data, error } = await client
    .from('websites')
    .select('brand_id, brands(organization_id)')
    .eq('id', websiteId)
    .maybeSingle()
  if (error) throw mapDatabaseError(error, 'Website')
  const organizationId = data?.brands?.organization_id
  if (!organizationId) throw AppError.notFound('Website', websiteId)
  return organizationId
}

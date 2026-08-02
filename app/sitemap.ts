import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/constants/seo'
import { tours } from '@/lib/site-data'
import { getCatalogService, getMasterDataService } from '@/lib/attraction-ticket/get-attraction-ticket-services'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'

const ATTRACTION_TICKET_WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const CMS_WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const CMS_LOCALE = 'vi'

/**
 * Only lists routes that are actually implemented and publicly indexable.
 * Nav/footer links to not-yet-built pages (e.g. /services, /destinations,
 * /faq) are intentionally excluded — submitting a 404 to search engines is
 * worse than omitting it. Add each page here as it ships (see
 * PROJECT_AUDIT.md §6 "Module thiếu" for what's still pending).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/tours`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/mice`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/hotels`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/cruises`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/flights`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/ve-may-bay`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/ve-vui-choi`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/ve-vui-choi/tat-ca`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/visa`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/tin-tuc`, changeFrequency: 'daily', priority: 0.7 },
  ]

  const tourRoutes: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${SITE_URL}/tour/${tour.id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Dynamic — reflects whatever is actually published right now, so this
  // list never drifts out of sync with the CMS the way a hardcoded array
  // would (unlike `tours` above, which is still `lib/site-data`'s static
  // seed — matching that module's own current data source, not a
  // deliberate inconsistency introduced here).
  const attractionTicketRoutes: MetadataRoute.Sitemap = await (async () => {
    try {
      const catalogService = await getCatalogService()
      const masterDataService = await getMasterDataService()
      const catalog = await catalogService.listPublishedCatalog(ATTRACTION_TICKET_WEBSITE_ID)
      const destinationIds = [...new Set(catalog.venues.map((v) => v.destinationId))]
      const destinations = await Promise.all(destinationIds.map((id) => masterDataService.getDestination(id)))
      const slugByDestinationId = new Map(
        destinations.map(({ destination, translations }) => [destination.id, translations.find((t) => t.locale === 'vi')?.slug ?? translations[0]?.slug]),
      )
      const venueDestinationSlugByVenueId = new Map(catalog.venues.map((v) => [v.id, slugByDestinationId.get(v.destinationId)]))

      const destinationRoutes: MetadataRoute.Sitemap = [...slugByDestinationId.values()]
        .filter((slug): slug is string => Boolean(slug))
        .map((slug) => ({ url: `${SITE_URL}/ve-vui-choi/${slug}`, changeFrequency: 'weekly', priority: 0.6 }))

      const productRoutes: MetadataRoute.Sitemap = catalog.products.flatMap((product) => {
        const destinationSlug = venueDestinationSlugByVenueId.get(product.attractionVenueId)
        return destinationSlug ? [{ url: `${SITE_URL}/ve-vui-choi/${destinationSlug}/${product.slug}`, changeFrequency: 'weekly' as const, priority: 0.7 }] : []
      })

      return [...destinationRoutes, ...productRoutes]
    } catch {
      // Sitemap generation must never 500 the whole route if the DB is
      // briefly unreachable — fall back to just the static entries above.
      return []
    }
  })()

  // Published cms_pages (generic Pages + News, Sprint 5A) — 'home' is
  // excluded (it's `/`, listed in staticRoutes above; app/[slug]/page.tsx
  // itself refuses to serve that slug).
  const cmsPageRoutes: MetadataRoute.Sitemap = await (async () => {
    try {
      const client = getPublicSupabaseClient()
      const { data: pages } = await client
        .from('cms_pages')
        .select('id, slug')
        .eq('website_id', CMS_WEBSITE_ID)
        .eq('locale', CMS_LOCALE)
        .neq('slug', 'home')
        .is('deleted_at', null)
      if (!pages || pages.length === 0) return []

      const { data: currentVersions } = await client
        .from('cms_page_versions')
        .select('page_id, updated_at')
        .in('page_id', pages.map((p) => p.id))
        .eq('is_current', true)
        .eq('status', 'PUBLISHED')
      const publishedPageIds = new Set((currentVersions ?? []).map((v) => v.page_id))
      const updatedAtByPageId = new Map((currentVersions ?? []).map((v) => [v.page_id, v.updated_at]))

      return pages
        .filter((p) => publishedPageIds.has(p.id))
        .map((p) => {
          const isNews = p.slug.startsWith(NEWS_SLUG_PREFIX)
          const path = isNews ? `/tin-tuc/${p.slug.slice(NEWS_SLUG_PREFIX.length)}` : `/${p.slug}`
          return {
            url: `${SITE_URL}${path}`,
            lastModified: updatedAtByPageId.get(p.id) ?? undefined,
            changeFrequency: isNews ? ('weekly' as const) : ('monthly' as const),
            priority: isNews ? 0.6 : 0.5,
          }
        })
    } catch {
      return []
    }
  })()

  return [...staticRoutes, ...tourRoutes, ...attractionTicketRoutes, ...cmsPageRoutes]
}

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/supabase/database.types'
import { TOUR_SLUG_PREFIX } from '@/lib/cms/tour-constants'
import type { TourDepartureStatus, TourPriceType } from '@/modules/tour-departures/domain/types'

export const TOUR_WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
export const TOUR_LOCALE = 'vi'

export type ItineraryDay = { day: number; title: string; description: string }
export type TourGalleryImage = { src: string; alt: string }

/**
 * Card-level view model shared by `/tours`, "related tours", and
 * `sitemap.ts` — one shape, one loader (`listPublishedTourCards`), so
 * every surface that lists Tours always reflects the same published set.
 * `country`/`departureCity` are read from the `content` section's block
 * config (not a relational column) — see the 2026-08 Sprint 7 Phase 6
 * migration note: `tour_departures` only models genuinely transactional
 * per-date data (price/seats/status), and master-data `destinations` only
 * has Vietnam-domestic rows today, so these two display-only fields live
 * as real editorial content on the tour's own overview block instead of
 * forcing either table to carry fabricated rows.
 */
export type PublicTourCard = {
  pageId: string
  slug: string
  title: string
  country: string
  departureCity: string
  categoryNames: string[]
  duration: string
  image: string | null
  imageAlt: string
  priceFrom: number | null
  priceType: TourPriceType | null
  departureDate: string | null
  seatsAvailable: number | null
  availability: TourDepartureStatus | null
}

export type PublicTourDetail = PublicTourCard & {
  body: string
  itinerary: ItineraryDay[]
  inclusions: string[]
  exclusions: string[]
  cancellationNote: string
  gallery: TourGalleryImage[]
  publishedAt: string | null
  seoMetadataId: string | null
}

type DepartureLite = {
  departureDate: string
  price: number
  priceType: TourPriceType
  seatsAvailable: number | null
  status: TourDepartureStatus
}

/** One row per page_id → all assigned category names (many-to-many, unlike News' single category). */
async function loadTourCategoryNames(client: SupabaseClient<Database>, pageIds: string[]): Promise<Map<string, string[]>> {
  if (pageIds.length === 0) return new Map()
  const { data: assignments } = await client.from('tour_page_categories').select('page_id, category_id').in('page_id', pageIds)
  if (!assignments || assignments.length === 0) return new Map()
  const categoryIds = [...new Set(assignments.map((a) => a.category_id))]
  const { data: categories } = await client.from('tour_categories').select('id, name').in('id', categoryIds)
  const nameById = new Map((categories ?? []).map((c) => [c.id, c.name]))
  const result = new Map<string, string[]>()
  for (const a of assignments) {
    const name = nameById.get(a.category_id)
    if (!name) continue
    const names = result.get(a.page_id) ?? []
    names.push(name)
    result.set(a.page_id, names)
  }
  return result
}

/** Earliest bookable departure per page — the one shown as the card's "from" price/date, matching the single-departure display the original static seed used. */
async function loadEarliestDepartures(client: SupabaseClient<Database>, pageIds: string[]): Promise<Map<string, DepartureLite>> {
  if (pageIds.length === 0) return new Map()
  const { data } = await client
    .from('tour_departures')
    .select('page_id, departure_date, price, price_type, seats_available, status')
    .in('page_id', pageIds)
    .order('departure_date', { ascending: true })
  const result = new Map<string, DepartureLite>()
  for (const row of data ?? []) {
    if (result.has(row.page_id)) continue
    result.set(row.page_id, {
      departureDate: row.departure_date,
      price: row.price,
      priceType: row.price_type as TourPriceType,
      seatsAvailable: row.seats_available,
      status: row.status as TourDepartureStatus,
    })
  }
  return result
}

type SectionConfigsByKey = Map<string, Record<string, unknown>>

/** Batches `cms_sections` + `cms_blocks` for a set of versions, grouped by version id then `section_key` — same two-query shape `lib/cms/news.ts` already uses. */
async function loadSectionConfigsByVersion(client: SupabaseClient<Database>, versionIds: string[]): Promise<Map<string, SectionConfigsByKey>> {
  const result = new Map<string, SectionConfigsByKey>()
  if (versionIds.length === 0) return result
  const { data: sectionRows } = await client.from('cms_sections').select('id, page_version_id, section_key').in('page_version_id', versionIds)
  const sectionIds = (sectionRows ?? []).map((s) => s.id)
  const { data: blockRows } = sectionIds.length
    ? await client.from('cms_blocks').select('section_id, config').in('section_id', sectionIds)
    : { data: [] as { section_id: string; config: unknown }[] }
  const configBySection = new Map((blockRows ?? []).map((b) => [b.section_id, b.config as Record<string, unknown>]))
  for (const section of sectionRows ?? []) {
    const config = configBySection.get(section.id)
    if (!config) continue
    if (!result.has(section.page_version_id)) result.set(section.page_version_id, new Map())
    result.get(section.page_version_id)!.set(section.section_key, config)
  }
  return result
}

function durationLabel(itineraryDayCount: number): string {
  return itineraryDayCount > 0 ? `${itineraryDayCount}N${itineraryDayCount - 1}Đ` : ''
}

/** Published Tours list — backs `/tours`, "related tours", and `sitemap.ts`. */
export async function listPublishedTourCards(client: SupabaseClient<Database>): Promise<PublicTourCard[]> {
  const { data: pages } = await client
    .from('cms_pages')
    .select('id, slug')
    .eq('website_id', TOUR_WEBSITE_ID)
    .eq('locale', TOUR_LOCALE)
    .like('slug', `${TOUR_SLUG_PREFIX}%`)
    .is('deleted_at', null)
  if (!pages || pages.length === 0) return []

  const pageIds = pages.map((p) => p.id)
  const { data: versions } = await client
    .from('cms_page_versions')
    .select('id, page_id, title')
    .in('page_id', pageIds)
    .eq('is_current', true)
    .eq('status', 'PUBLISHED')
  if (!versions || versions.length === 0) return []

  const versionIds = versions.map((v) => v.id)
  const [configsByVersion, categoryNamesByPage, departuresByPage] = await Promise.all([
    loadSectionConfigsByVersion(client, versionIds),
    loadTourCategoryNames(client, pageIds),
    loadEarliestDepartures(client, pageIds),
  ])
  const pageById = new Map(pages.map((p) => [p.id, p]))

  const cards = versions
    .map((version): PublicTourCard | null => {
      const page = pageById.get(version.page_id)
      if (!page) return null
      const sections = configsByVersion.get(version.id) ?? new Map()
      const content = sections.get('content') ?? {}
      const itinerary = (sections.get('itinerary')?.days as ItineraryDay[] | undefined) ?? []
      const gallery = (sections.get('gallery')?.images as TourGalleryImage[] | undefined) ?? []
      const departure = departuresByPage.get(page.id) ?? null
      return {
        pageId: page.id,
        slug: page.slug.slice(TOUR_SLUG_PREFIX.length),
        title: version.title,
        country: String(content.country ?? ''),
        departureCity: String(content.departureCity ?? ''),
        categoryNames: categoryNamesByPage.get(page.id) ?? [],
        duration: durationLabel(itinerary.length),
        image: gallery[0]?.src ?? null,
        imageAlt: gallery[0]?.alt || version.title,
        priceFrom: departure?.price ?? null,
        priceType: departure?.priceType ?? null,
        departureDate: departure?.departureDate ?? null,
        seatsAvailable: departure?.seatsAvailable ?? null,
        availability: departure?.status ?? null,
      }
    })
    .filter((c): c is PublicTourCard => c !== null)

  return cards.sort((a, b) => (a.departureDate ?? '').localeCompare(b.departureDate ?? ''))
}

/** Active category names in admin sort order — backs the `/tours` filter chips (was a hardcoded `tourFilters` array). */
export async function listActiveTourCategoryNames(client: SupabaseClient<Database>): Promise<string[]> {
  const { data } = await client.from('tour_categories').select('name').eq('is_active', true).order('sort_order')
  return (data ?? []).map((c) => c.name)
}

/** Other published Tours sharing at least one category, for the detail page's "related tours" section. */
export async function listRelatedTourCards(
  client: SupabaseClient<Database>,
  categoryNames: string[],
  excludePageId: string,
  limit: number,
): Promise<PublicTourCard[]> {
  if (categoryNames.length === 0) return []
  const all = await listPublishedTourCards(client)
  return all.filter((t) => t.pageId !== excludePageId && t.categoryNames.some((c) => categoryNames.includes(c))).slice(0, limit)
}

/** Full detail for `/tour/[slug]` — single published Tour, its itinerary/policy/gallery blocks, categories, and earliest departure. */
export async function loadPublicTourDetail(client: SupabaseClient<Database>, slug: string): Promise<PublicTourDetail | null> {
  const fullSlug = `${TOUR_SLUG_PREFIX}${slug}`
  const { data: page } = await client
    .from('cms_pages')
    .select('id, slug')
    .eq('website_id', TOUR_WEBSITE_ID)
    .eq('locale', TOUR_LOCALE)
    .ilike('slug', fullSlug)
    .is('deleted_at', null)
    .maybeSingle()
  if (!page) return null

  const { data: version } = await client
    .from('cms_page_versions')
    .select('id, title, published_at, seo_metadata_id')
    .eq('page_id', page.id)
    .eq('is_current', true)
    .eq('status', 'PUBLISHED')
    .maybeSingle()
  if (!version) return null

  const [configsByVersion, categoryNamesByPage, departuresByPage] = await Promise.all([
    loadSectionConfigsByVersion(client, [version.id]),
    loadTourCategoryNames(client, [page.id]),
    loadEarliestDepartures(client, [page.id]),
  ])
  const sections = configsByVersion.get(version.id) ?? new Map()
  const content = sections.get('content') ?? {}
  const itinerary = (sections.get('itinerary')?.days as ItineraryDay[] | undefined) ?? []
  const policy = sections.get('policy') ?? {}
  const gallery = (sections.get('gallery')?.images as TourGalleryImage[] | undefined) ?? []
  const departure = departuresByPage.get(page.id) ?? null

  return {
    pageId: page.id,
    slug,
    title: version.title,
    country: String(content.country ?? ''),
    departureCity: String(content.departureCity ?? ''),
    categoryNames: categoryNamesByPage.get(page.id) ?? [],
    duration: durationLabel(itinerary.length),
    image: gallery[0]?.src ?? null,
    imageAlt: gallery[0]?.alt || version.title,
    priceFrom: departure?.price ?? null,
    priceType: departure?.priceType ?? null,
    departureDate: departure?.departureDate ?? null,
    seatsAvailable: departure?.seatsAvailable ?? null,
    availability: departure?.status ?? null,
    body: String(content.body ?? ''),
    itinerary,
    inclusions: (policy.inclusions as string[] | undefined) ?? [],
    exclusions: (policy.exclusions as string[] | undefined) ?? [],
    cancellationNote: String(policy.cancellationNote ?? ''),
    gallery,
    publishedAt: version.published_at,
    seoMetadataId: version.seo_metadata_id,
  }
}

export type AttractionSearchableProduct = {
  slug: string
  destinationSlug: string
  title: string
  venueName: string
  destinationName: string
  imageUrl: string
  priceFrom: number | null
  experienceTag?: string | null
}

export type AttractionSearchableVenue = {
  slug: string
  name: string
  destinationSlug: string
  productCount: number
}

export type AttractionSearchableDestination = {
  slug: string
  name: string
}

export type AttractionSearchableCategory = {
  slug: string
  name: string
}

export type AttractionSearchCatalog = {
  products: AttractionSearchableProduct[]
  venues: AttractionSearchableVenue[]
  destinations: AttractionSearchableDestination[]
  categories: AttractionSearchableCategory[]
}

export type AttractionSearchResult = AttractionSearchCatalog

const MAX_RESULTS_PER_GROUP = 5

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function matchesProduct(product: AttractionSearchableProduct, normalizedQuery: string): boolean {
  return (
    normalize(product.title).includes(normalizedQuery) ||
    normalize(product.venueName).includes(normalizedQuery) ||
    normalize(product.destinationName).includes(normalizedQuery) ||
    (product.experienceTag ? normalize(product.experienceTag).includes(normalizedQuery) : false)
  )
}

/**
 * Same field set as `searchAttractionCatalog`, but for a listing page that
 * needs every match (not the 5-per-group cap used for the autocomplete
 * dropdown) — used by `/ve-vui-choi/tat-ca?q=` to make the search box's
 * free-text submit actually filter real results, not just suggestions.
 */
export function filterProductsByQuery<P extends AttractionSearchableProduct>(products: readonly P[], rawQuery: string): P[] {
  const query = normalize(rawQuery)
  if (!query) return [...products]
  return products.filter((product) => matchesProduct(product, query))
}

/**
 * Matches across the fields that actually exist in the attraction-ticket
 * schema today (database/migrations/0016_attraction_ticket_module.sql,
 * 0018_attraction_ticket_categories.sql): product title (product_name /
 * marketing_title), venue name (this module's "brand"/attraction_name —
 * see attraction-brand-section.tsx, there is no separate brand table),
 * destination name, category name. `search_keywords` is intentionally not
 * matched against: no such column exists on attraction_products or
 * attraction_product_translations, and fabricating one client-side would
 * be exactly the "fake search" the brief rules out.
 *
 * Diacritic-insensitive so "ha long" matches "Hạ Long" — a Vietnamese user
 * typing without dấu is the common case, not an edge case.
 */
export function searchAttractionCatalog(catalog: AttractionSearchCatalog, rawQuery: string): AttractionSearchResult {
  const query = normalize(rawQuery)
  if (!query) return { products: [], venues: [], destinations: [], categories: [] }

  return {
    products: catalog.products.filter((product) => matchesProduct(product, query)).slice(0, MAX_RESULTS_PER_GROUP),
    venues: catalog.venues.filter((venue) => normalize(venue.name).includes(query)).slice(0, MAX_RESULTS_PER_GROUP),
    destinations: catalog.destinations.filter((destination) => normalize(destination.name).includes(query)).slice(0, MAX_RESULTS_PER_GROUP),
    categories: catalog.categories.filter((category) => normalize(category.name).includes(query)).slice(0, MAX_RESULTS_PER_GROUP),
  }
}

export function hasAnyMatch(result: AttractionSearchResult): boolean {
  return result.products.length > 0 || result.venues.length > 0 || result.destinations.length > 0 || result.categories.length > 0
}

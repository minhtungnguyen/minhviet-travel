import 'server-only'
import type { AttractionProduct, AttractionProductTranslation, AttractionVenue, AttractionVenueTranslation } from '@/modules/attraction-ticket/domain/types'
import type { AttractionProductCardViewModel } from '@/components/attraction-ticket/attraction-product-card'
import { getMasterDataService } from '@/lib/attraction-ticket/get-attraction-ticket-services'

const LOCALE = 'vi'

/**
 * Joins the 4 flat arrays `AttractionCatalogService#listPublishedCatalog`
 * returns into card-ready view models, resolving destination names via
 * `MasterDataService` (one call, not per-product — module-boundaries.md
 * composition happens here, not inside either module's own service).
 */
export async function buildProductCardViewModels(input: {
  products: AttractionProduct[]
  venues: AttractionVenue[]
  productTranslations: AttractionProductTranslation[]
  venueTranslations: AttractionVenueTranslation[]
  /** {productId -> categoryId} links (attraction_product_categories) + {categoryId -> name/slug}, both optional — omit entirely for callers that don't need the "experience tag" (e.g. cross-sell rails). */
  categoryLinks?: { attractionProductId: string; attractionCategoryId: string }[]
  categoryNameById?: Map<string, string>
  categorySlugById?: Map<string, string>
}): Promise<AttractionProductCardViewModel[]> {
  const venueById = new Map(input.venues.map((v) => [v.id, v]))
  const venueTranslationByVenueId = new Map(input.venueTranslations.filter((t) => t.locale === LOCALE).map((t) => [t.attractionVenueId, t]))
  const productTranslationByProductId = new Map(input.productTranslations.filter((t) => t.locale === LOCALE).map((t) => [t.attractionProductId, t]))
  const firstCategoryIdByProductId = new Map<string, string>()
  for (const link of input.categoryLinks ?? []) {
    if (!firstCategoryIdByProductId.has(link.attractionProductId)) firstCategoryIdByProductId.set(link.attractionProductId, link.attractionCategoryId)
  }

  const masterData = await getMasterDataService()
  const destinationIds = [...new Set(input.venues.map((v) => v.destinationId))]
  const destinationEntries = await Promise.all(destinationIds.map((id) => masterData.getDestination(id)))
  const destinationNameById = new Map(
    destinationEntries.map(({ destination, translations }) => [
      destination.id,
      translations.find((t) => t.locale === LOCALE)?.name ?? translations[0]?.name ?? '',
    ]),
  )

  return input.products
    .map((product): AttractionProductCardViewModel | null => {
      const venue = venueById.get(product.attractionVenueId)
      const productTranslation = productTranslationByProductId.get(product.id)
      const venueTranslation = venue ? venueTranslationByVenueId.get(venue.id) : undefined
      const destination = venue ? destinationEntries.find((d) => d.destination.id === venue.destinationId) : undefined
      if (!venue || !productTranslation || !destination) return null

      const categoryId = firstCategoryIdByProductId.get(product.id)
      const experienceTag = categoryId ? (input.categoryNameById?.get(categoryId) ?? null) : null
      const experienceCategorySlug = categoryId ? (input.categorySlugById?.get(categoryId) ?? null) : null

      return {
        slug: product.slug,
        destinationSlug: destination.translations.find((t) => t.locale === LOCALE)?.slug ?? destination.translations[0]?.slug ?? '',
        title: productTranslation.title,
        summary: productTranslation.summary ?? '',
        imageUrl: product.imageUrl,
        imageAlt: product.imageAlt,
        venueName: venueTranslation?.name ?? '',
        destinationName: destinationNameById.get(venue.destinationId) ?? '',
        priceFrom: product.priceFrom,
        isFeatured: product.isFeatured,
        createdAt: product.createdAt,
        experienceTag,
        experienceCategorySlug,
      }
    })
    .filter((vm): vm is AttractionProductCardViewModel => vm !== null)
}

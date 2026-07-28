import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site/site-chrome'
import { AttractionTicketHero, type AttractionSeasonalBanner } from '@/components/attraction-ticket/attraction-ticket-hero'
import { AttractionTrustStrip } from '@/components/attraction-ticket/attraction-trust-strip'
import { AttractionDestinationSection, type AttractionDestinationTile } from '@/components/attraction-ticket/attraction-destination-section'
import { AttractionBrandSection, type AttractionBrandTile } from '@/components/attraction-ticket/attraction-brand-section'
import { AttractionCategorySection, type AttractionCategoryRail } from '@/components/attraction-ticket/attraction-category-section'
import { AttractionFeaturedSection } from '@/components/attraction-ticket/attraction-featured-section'
import { AttractionWhySection } from '@/components/attraction-ticket/attraction-why-section'
import { AttractionFaqSection } from '@/components/attraction-ticket/attraction-faq-section'
import { AttractionFinalCta } from '@/components/attraction-ticket/attraction-final-cta'
import { getCatalogService, getMasterDataService } from '@/lib/attraction-ticket/get-attraction-ticket-services'
import { buildProductCardViewModels } from '@/lib/attraction-ticket/build-catalog-view-models'
import type { AttractionSearchCatalog } from '@/lib/attraction-ticket/search-attraction-catalog'
import { SITE_URL } from '@/constants/seo'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'

/**
 * CMS integration point (Hero "Seasonal Banner", docs/design/mv-ticket/
 * DESIGN-BIBLE-v1.0.md decisions 2026-07-28) — `null` today because there
 * is no active campaign. Set to a real {label, href} only when a real
 * campaign exists; never a fabricated "flash sale" ribbon (honesty
 * discipline, 01-design-direction.md §7). Wiring this to an actual CMS
 * content row (vs. this constant) is a follow-up, tracked separately.
 */
const SEASONAL_BANNER: AttractionSeasonalBanner | null = null

export const metadata: Metadata = {
  title: 'Vé vui chơi & trải nghiệm | Minh Việt Travel',
  description: 'Đặt vé cáp treo, công viên nước, khu vui chơi trực tuyến — xác nhận nhanh, vé điện tử, giá minh bạch.',
  alternates: { canonical: '/ve-vui-choi' },
  openGraph: {
    title: 'Vé vui chơi & trải nghiệm | Minh Việt Travel',
    description: 'Đặt vé cáp treo, công viên nước, khu vui chơi trực tuyến — xác nhận nhanh, vé điện tử, giá minh bạch.',
    url: `${SITE_URL}/ve-vui-choi`,
    locale: 'vi_VN',
    type: 'website',
    images: [{ url: '/images/hero/ha-long-bay.jpg' }],
  },
}

function RelatedLinks() {
  const links = [
    { label: 'Combo du lịch trọn gói', href: '/combo' },
    { label: 'Khách sạn', href: '/hotels' },
    { label: 'Du thuyền', href: '/cruises' },
    { label: 'Tour thiết kế riêng', href: '/tour-thiet-ke' },
    { label: 'Liên hệ', href: '/contact' },
  ]
  return (
    <div className="border-t border-border bg-background py-8">
      <div className="container-mv flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <span className="font-semibold text-mv-deep-navy">Tìm hiểu thêm:</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-mv-journey-blue hover:underline">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default async function AttractionTicketLandingPage() {
  const catalogService = await getCatalogService()
  const masterDataService = await getMasterDataService()

  const catalog = await catalogService.listPublishedCatalog(WEBSITE_ID)
  const categoryEntries = await catalogService.listCategories(WEBSITE_ID, LOCALE)
  const categoryLinks = await catalogService.listCategoryLinksForProducts(catalog.products.map((p) => p.id))
  const categoryNameById = new Map(categoryEntries.map(({ category, name }) => [category.id, name]))
  const categorySlugById = new Map(categoryEntries.map(({ category }) => [category.id, category.slug]))
  const products = await buildProductCardViewModels({ ...catalog, categoryLinks, categoryNameById, categorySlugById })
  const categoryChips = categoryEntries.map(({ category, name }) => ({ slug: category.slug, name, iconKey: category.iconKey }))

  const destinationIds = [...new Set(catalog.venues.map((v) => v.destinationId))]
  const destinationEntries = await Promise.all(destinationIds.map((id) => masterDataService.getDestination(id)))
  const destinationSlugByDestinationId = new Map(
    destinationEntries.map(({ destination, translations }) => [destination.id, translations.find((t) => t.locale === LOCALE)?.slug ?? translations[0]?.slug ?? '']),
  )
  const destinations: AttractionDestinationTile[] = destinationEntries.map(({ destination, translations }) => {
    const translation = translations.find((t) => t.locale === LOCALE) ?? translations[0]
    const productCount = products.filter((p) => p.destinationSlug === translation?.slug).length
    return {
      slug: translation?.slug ?? destination.id,
      name: translation?.name ?? '',
      tagline: translation?.description ?? '',
      imageUrl: catalog.venues.find((v) => v.destinationId === destination.id)?.imageUrl ?? '',
      imageAlt: catalog.venues.find((v) => v.destinationId === destination.id)?.imageAlt ?? '',
      productCount,
    }
  })

  const featuredProducts = [...products].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 6)
  const destinationSearchOptions = destinations.map((d) => ({ slug: d.slug, name: d.name }))

  // --- Brand Section (D6, mandatory) — real venue.is_featured + real product count per venue ---
  const venueTranslationByVenueId = new Map(catalog.venueTranslations.filter((t) => t.locale === LOCALE).map((t) => [t.attractionVenueId, t]))
  const brandTiles: AttractionBrandTile[] = catalog.venues
    .filter((v) => v.isFeatured)
    .map((venue) => ({
      slug: venue.slug,
      name: venueTranslationByVenueId.get(venue.id)?.name ?? '',
      imageUrl: venue.imageUrl,
      imageAlt: venue.imageAlt,
      destinationSlug: destinationSlugByDestinationId.get(venue.destinationId) ?? '',
      productCount: catalog.products.filter((p) => p.attractionVenueId === venue.id).length,
    }))

  // --- Category Section — one rail per category with ≥1 real tagged product ---
  const productViewModelById = new Map(catalog.products.map((p) => [p.id, products.find((vm) => vm.slug === p.slug)]))
  const categoryRails: AttractionCategoryRail[] = categoryEntries.map(({ category, name }) => ({
    slug: category.slug,
    name,
    products: categoryLinks
      .filter((link) => link.attractionCategoryId === category.id)
      .map((link) => productViewModelById.get(link.attractionProductId))
      .filter((vm): vm is NonNullable<typeof vm> => vm !== undefined),
  }))

  // --- Search box index (Command Center keyword search) — every venue
  // (not just featured, unlike brandTiles below) so typing finds any real
  // venue name, matching product_name/attraction_name/destination_name/
  // category_name (search-box-redesign brief §6; no `search_keywords`
  // column exists on this schema, so it's not matched against — see
  // lib/attraction-ticket/search-attraction-catalog.ts).
  const searchCatalog: AttractionSearchCatalog = {
    products: products.map((p) => ({
      slug: p.slug,
      destinationSlug: p.destinationSlug,
      title: p.title,
      venueName: p.venueName,
      destinationName: p.destinationName,
      imageUrl: p.imageUrl,
      priceFrom: p.priceFrom,
      experienceTag: p.experienceTag,
    })),
    venues: catalog.venues
      .map((venue) => ({
        slug: venue.slug,
        name: venueTranslationByVenueId.get(venue.id)?.name ?? '',
        destinationSlug: destinationSlugByDestinationId.get(venue.destinationId) ?? '',
        productCount: catalog.products.filter((p) => p.attractionVenueId === venue.id).length,
      }))
      .filter((venue) => venue.name !== ''),
    destinations: destinationSearchOptions,
    categories: categoryEntries.map(({ category, name }) => ({ slug: category.slug, name })),
  }
  const featuredVenues = brandTiles.map((venue) => ({ slug: venue.slug, name: venue.name, destinationSlug: venue.destinationSlug }))

  return (
    <SiteChrome>
      <AttractionTicketHero categories={categoryChips} searchCatalog={searchCatalog} featuredVenues={featuredVenues} seasonalBanner={SEASONAL_BANNER} />
      <AttractionTrustStrip />
      <AttractionBrandSection venues={brandTiles} />
      <AttractionCategorySection rails={categoryRails} />
      <AttractionFeaturedSection products={featuredProducts} />
      <AttractionDestinationSection destinations={destinations} />
      <AttractionWhySection />
      <AttractionFaqSection />
      <RelatedLinks />
      <AttractionFinalCta />
    </SiteChrome>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { SectionHeading } from '@/components/homepage/section-heading'
import { AttractionProductCard } from '@/components/attraction-ticket/attraction-product-card'
import { getCatalogService } from '@/lib/attraction-ticket/get-attraction-ticket-services'
import { buildProductCardViewModels } from '@/lib/attraction-ticket/build-catalog-view-models'
import { filterProductsByQuery } from '@/lib/attraction-ticket/search-attraction-catalog'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'

export const metadata: Metadata = {
  title: 'Tất cả vé vui chơi | Minh Việt Travel',
  description: 'Toàn bộ vé vui chơi, cáp treo, công viên nước hiện có của Minh Việt — xác nhận nhanh, vé điện tử.',
  alternates: { canonical: '/ve-vui-choi/tat-ca' },
}

/**
 * Minimal full listing, same scope decision as `/combo/tat-ca`: reuses
 * `AttractionProductCard` as-is, no client-state filter architecture.
 * 3 query params, each matched against a real field on the view model:
 * `destination` (slug — `AttractionCategoryChips`/search box both link
 * here with a slug, not a display name), `category` (slug — the category
 * chips already produced `?category=<slug>` before this page read it;
 * this closes that gap), `q` (free-text keyword from the search box's
 * "Tìm kiếm" submit — same field set as the autocomplete, see
 * lib/attraction-ticket/search-attraction-catalog.ts). `date` is also
 * present on the URL when the search box's optional date field was filled
 * in, but is deliberately not read here: there is no per-date availability
 * data cached in this module (that only exists live, per-product, from the
 * provider — docs/mv-ticket/02-system-architecture.md §6), so filtering by
 * it here would be exactly the "fake search" the brief rules out.
 */
export default async function AttractionTicketListPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string; category?: string; q?: string }>
}) {
  const { destination, category, q } = await searchParams
  const catalogService = await getCatalogService()
  const catalog = await catalogService.listPublishedCatalog(WEBSITE_ID)
  const categoryEntries = await catalogService.listCategories(WEBSITE_ID, LOCALE)
  const categoryLinks = await catalogService.listCategoryLinksForProducts(catalog.products.map((p) => p.id))
  const categoryNameById = new Map(categoryEntries.map(({ category: c, name }) => [c.id, name]))
  const categorySlugById = new Map(categoryEntries.map(({ category: c }) => [c.id, c.slug]))
  const allProducts = await buildProductCardViewModels({ ...catalog, categoryLinks, categoryNameById, categorySlugById })

  let products = allProducts
  if (destination) products = products.filter((p) => p.destinationSlug === destination)
  if (category) products = products.filter((p) => p.experienceCategorySlug === category)
  if (q) products = filterProductsByQuery(products, q)

  const activeFilterCount = [destination, category, q].filter(Boolean).length
  const destinationName = destination ? (allProducts.find((p) => p.destinationSlug === destination)?.destinationName ?? destination) : null
  const categoryName = category ? (categoryEntries.find(({ category: c }) => c.slug === category)?.name ?? category) : null

  const title = destinationName
    ? `Vé vui chơi tại ${destinationName}`
    : categoryName
      ? `Vé vui chơi: ${categoryName}`
      : q
        ? `Kết quả cho "${q}"`
        : 'Tất cả vé vui chơi'

  return (
    <SiteChrome>
      <section className="border-b border-mv-border-soft bg-mv-ice-blue/40 py-14 lg:py-16">
        <div className="container-mv">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-mv-journey-blue">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/ve-vui-choi" className="transition-colors hover:text-mv-journey-blue">
              Vé vui chơi
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">Tất cả vé</span>
          </nav>

          <SectionHeading eyebrow="Toàn bộ vé vui chơi" title={title} description={`${products.length} vé đang sẵn sàng.`} />

          {activeFilterCount > 0 && (
            <Link href="/ve-vui-choi/tat-ca" className="link-underline mt-4 inline-block text-sm font-semibold text-mv-journey-blue">
              Xóa bộ lọc
            </Link>
          )}
        </div>
      </section>

      <section className="bg-background py-12 lg:py-16">
        <div className="container-mv">
          {products.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              Chưa có vé nào phù hợp.{' '}
              <Link href="/ve-vui-choi/tat-ca" className="text-mv-journey-blue hover:underline">
                Xem tất cả vé
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <AttractionProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteChrome>
  )
}

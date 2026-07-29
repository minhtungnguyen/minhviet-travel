import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { SectionHeading } from '@/components/homepage/section-heading'
import { AttractionProductCard } from '@/components/attraction-ticket/attraction-product-card'
import { getCatalogService, getMasterDataService } from '@/lib/attraction-ticket/get-attraction-ticket-services'
import { buildProductCardViewModels } from '@/lib/attraction-ticket/build-catalog-view-models'
import { SITE_URL } from '@/constants/seo'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'

async function resolveDestination(destinationSlug: string) {
  const masterDataService = await getMasterDataService()
  const destinations = await masterDataService.listDestinations(LOCALE)
  return destinations.find((d) => d.translation?.slug === destinationSlug) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ destinationSlug: string }> }): Promise<Metadata> {
  const { destinationSlug } = await params
  const destination = await resolveDestination(destinationSlug)
  if (!destination) return {}
  const name = destination.translation?.name ?? destinationSlug
  return {
    title: `Vé vui chơi tại ${name} | Minh Việt Travel`,
    description: `Danh sách vé vui chơi, cáp treo, khu vui chơi tại ${name} — xác nhận nhanh, vé điện tử.`,
    alternates: { canonical: `/ve-vui-choi/${destinationSlug}` },
    openGraph: { url: `${SITE_URL}/ve-vui-choi/${destinationSlug}`, locale: 'vi_VN', type: 'website' },
  }
}

export default async function AttractionTicketDestinationPage({ params }: { params: Promise<{ destinationSlug: string }> }) {
  const { destinationSlug } = await params
  const destination = await resolveDestination(destinationSlug)
  if (!destination) notFound()

  const catalogService = await getCatalogService()
  const catalog = await catalogService.listPublishedCatalog(WEBSITE_ID)
  const allProducts = await buildProductCardViewModels(catalog)
  const products = allProducts.filter((p) => p.destinationSlug === destinationSlug)

  const destinationName = destination.translation?.name ?? destinationSlug

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
            <span className="text-foreground">{destinationName}</span>
          </nav>

          <SectionHeading
            eyebrow="Điểm đến"
            title={`Vé vui chơi tại ${destinationName}`}
            description={destination.translation?.description || `${products.length} vé đang sẵn sàng tại ${destinationName}.`}
          />
        </div>
      </section>

      <section className="bg-background py-12 lg:py-16">
        <div className="container-mv">
          {products.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              Chưa có vé nào tại {destinationName}.{' '}
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

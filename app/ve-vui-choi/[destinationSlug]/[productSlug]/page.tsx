import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MapPin } from 'lucide-react'
import { SiteChrome } from '@/components/site/site-chrome'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import { AttractionBookingPanel, AttractionBookingMobileBar } from '@/components/attraction-ticket/attraction-booking-panel'
import { AttractionGallery } from '@/components/attraction-ticket/attraction-gallery'
import { AttractionProductCard } from '@/components/attraction-ticket/attraction-product-card'
import { getCatalogService, getMasterDataService } from '@/lib/attraction-ticket/get-attraction-ticket-services'
import { buildProductCardViewModels } from '@/lib/attraction-ticket/build-catalog-view-models'
import { buildVariantOptions } from '@/lib/attraction-ticket/build-variant-options'
import { SITE_URL } from '@/constants/seo'

const WEBSITE_ID = '00000000-0000-4000-8000-000000000003'
const LOCALE = 'vi'

const TOMORROW = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

async function loadProductPage(destinationSlug: string, productSlug: string) {
  const catalogService = await getCatalogService()
  const masterDataService = await getMasterDataService()

  let detail
  try {
    detail = await catalogService.getPublishedProductBySlug(WEBSITE_ID, productSlug)
  } catch {
    return null
  }
  const { product, translations, faqs, crossSells } = detail
  const translation = translations.find((t) => t.locale === LOCALE) ?? translations[0]
  if (!translation) return null

  const venueResult = await catalogService.getPublishedVenueById(product.attractionVenueId).catch(() => null)
  if (!venueResult) return null
  const venueTranslation = venueResult.translations.find((t) => t.locale === LOCALE) ?? venueResult.translations[0]

  const destinationResult = await masterDataService.getDestination(venueResult.venue.destinationId).catch(() => null)
  const destinationTranslation = destinationResult?.translations.find((t) => t.locale === LOCALE) ?? destinationResult?.translations[0]
  if (!destinationResult || destinationTranslation?.slug !== destinationSlug) return null

  const variantMappings = await catalogService.listProductVariantOptions(product.id)
  const variantOptions = await buildVariantOptions(variantMappings, TOMORROW)

  const catalog = await catalogService.listPublishedCatalog(WEBSITE_ID, product.attractionVenueId)
  const relatedProducts = (await buildProductCardViewModels(catalog)).filter((p) => p.slug !== productSlug).slice(0, 3)

  return {
    product,
    translation,
    venue: venueResult.venue,
    venueTranslation,
    destinationName: destinationTranslation?.name ?? '',
    destinationSlug,
    faqs: faqs.filter((f) => f.locale === LOCALE),
    crossSells,
    variantOptions,
    relatedProducts,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destinationSlug: string; productSlug: string }>
}): Promise<Metadata> {
  const { destinationSlug, productSlug } = await params
  const data = await loadProductPage(destinationSlug, productSlug)
  if (!data) return {}
  return {
    title: data.translation.metaTitle || `${data.translation.title} | Minh Việt Travel`,
    description: data.translation.metaDescription || data.translation.summary || undefined,
    alternates: { canonical: `/ve-vui-choi/${destinationSlug}/${productSlug}` },
    openGraph: {
      title: data.translation.title,
      description: data.translation.summary ?? undefined,
      url: `${SITE_URL}/ve-vui-choi/${destinationSlug}/${productSlug}`,
      locale: 'vi_VN',
      type: 'website',
      images: [{ url: data.product.imageUrl }],
    },
  }
}

export default async function AttractionTicketProductPage({
  params,
}: {
  params: Promise<{ destinationSlug: string; productSlug: string }>
}) {
  const { destinationSlug, productSlug } = await params
  const data = await loadProductPage(destinationSlug, productSlug)
  if (!data) notFound()

  const { product, translation, venueTranslation, destinationName, faqs, crossSells, variantOptions, relatedProducts } = data

  return (
    <SiteChrome>
      <section className="border-b border-mv-border-soft bg-mv-ice-blue/40 py-6">
        <div className="container-mv">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-mv-journey-blue">
              Trang chủ
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/ve-vui-choi" className="transition-colors hover:text-mv-journey-blue">
              Vé vui chơi
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href={`/ve-vui-choi/${destinationSlug}`} className="transition-colors hover:text-mv-journey-blue">
              {destinationName}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="line-clamp-1 text-foreground">{translation.title}</span>
          </nav>
        </div>
      </section>

      <div className="container-mv py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            {product.galleryImages.length > 0 ? (
              <div className="shadow-soft rounded-2xl">
                <AttractionGallery images={product.galleryImages} title={translation.title} />
              </div>
            ) : (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-soft">
                <Image src={product.imageUrl} alt={product.imageAlt} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
              </div>
            )}

            <div className="mt-6">
              <p className="flex items-center gap-1.5 text-xs font-medium text-mv-journey-blue">
                <MapPin className="size-3.5" />
                {venueTranslation?.name} · {destinationName}
              </p>
              <h1 className="mt-2 text-balance font-display text-3xl font-bold leading-tight text-mv-deep-navy sm:text-4xl">
                {translation.title}
              </h1>
              {translation.summary && <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">{translation.summary}</p>}
            </div>

            {venueTranslation && venueTranslation.highlights.length > 0 && (
              <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {venueTranslation.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 rounded-xl bg-mv-ice-blue/50 p-3 text-sm text-foreground">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-mv-journey-blue" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            {translation.description && (
              <div className="mt-8 border-t border-border pt-8">
                <h2 className="font-display text-xl font-bold text-mv-deep-navy">Mô tả chi tiết</h2>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{translation.description}</p>
              </div>
            )}

            {venueTranslation?.usageGuide && (
              <div className="mt-8 border-t border-border pt-8">
                <h2 className="font-display text-xl font-bold text-mv-deep-navy">Hướng dẫn sử dụng</h2>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{venueTranslation.usageGuide}</p>
              </div>
            )}

            {(translation.cancellationPolicy || venueTranslation?.policy) && (
              <div className="mt-8 border-t border-border pt-8">
                <h2 className="font-display text-xl font-bold text-mv-deep-navy">Chính sách hủy / đổi vé</h2>
                {translation.cancellationPolicy && <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{translation.cancellationPolicy}</p>}
                {venueTranslation?.policy && <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{venueTranslation.policy}</p>}
              </div>
            )}

            {faqs.length > 0 && (
              <div className="mt-8 border-t border-border pt-8">
                <h2 className="font-display text-xl font-bold text-mv-deep-navy">Câu hỏi thường gặp</h2>
                <Accordion className="mt-4 rounded-2xl bg-card px-5 shadow-soft">
                  {faqs
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionPanel>{faq.answer}</AccordionPanel>
                      </AccordionItem>
                    ))}
                </Accordion>
              </div>
            )}

            {crossSells.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
                <span className="font-semibold text-mv-deep-navy">Xem thêm:</span>
                {crossSells
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((cs) => (
                    <Link key={cs.id} href={cs.relatedUrl} className="text-mv-journey-blue hover:underline">
                      {cs.label}
                    </Link>
                  ))}
              </div>
            )}

            {relatedProducts.length > 0 && (
              <div className="mt-10 border-t border-border pt-8">
                <h2 className="font-display text-xl font-bold text-mv-deep-navy">Vé liên quan tại {destinationName}</h2>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {relatedProducts.map((rp) => (
                    <AttractionProductCard key={rp.slug} product={rp} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <AttractionBookingPanel productId={product.id} websiteId={WEBSITE_ID} variantOptions={variantOptions} />
            </div>
          </aside>

          {/* Mobile: full panel inline in document flow, plus a sticky summary bar linking to it */}
          <div className="lg:hidden">
            <AttractionBookingPanel productId={product.id} websiteId={WEBSITE_ID} variantOptions={variantOptions} />
          </div>
        </div>
      </div>

      <AttractionBookingMobileBar priceFrom={product.priceFrom} />
    </SiteChrome>
  )
}

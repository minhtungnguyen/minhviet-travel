import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { tours } from '@/lib/site-data'
import {
  getTourDetailContent,
  standardPaymentPolicy,
  standardCancellationPolicy,
  cancellationPolicyNote,
} from '@/lib/tours/tour-detail-content'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { TourGallery } from '@/components/site/tour-detail/gallery'
import { TourItinerary } from '@/components/site/tour-detail/itinerary'
import { TourInclusions } from '@/components/site/tour-detail/inclusions'
import { TourPolicy } from '@/components/site/tour-detail/policy'
import { TourBookingCard } from '@/components/site/tour-detail/booking-card'
import { RelatedTourCard } from '@/components/site/tour-detail/related-tour-card'
import { Reveal } from '@/components/mv/reveal'
import { TourDetailJsonLd } from '@/components/seo/json-ld'
import { SITE_URL } from '@/constants/seo'

export function generateStaticParams() {
  return tours.map((t) => ({ slug: t.id }))
}

function findTour(slug: string) {
  const tour = tours.find((t) => t.id === slug)
  const detail = tour ? getTourDetailContent(tour.id) : undefined
  if (!tour || !detail) return null
  return { tour, detail }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const found = findTour(slug)
  if (!found) return { title: 'Không tìm thấy hành trình | Minh Việt Travel' }

  const { tour, detail } = found
  const priceLabel = detail.priceType === 'estimate' ? 'Giá tham khảo' : 'Giá'
  const title = `${tour.title} | Minh Việt Travel`
  const description = `${tour.duration} · Khởi hành từ ${tour.departure}. ${priceLabel} ${tour.price}. Lịch trình chi tiết, bao gồm/không bao gồm và chính sách thanh toán, hoàn hủy rõ ràng.`
  const canonicalPath = `/tour/${tour.id}`
  const ogImage = detail.gallery[0]?.src ?? tour.image

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: tour.title }],
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const found = findTour(slug)
  if (!found) notFound()
  const { tour, detail } = found

  const related = tours.filter((t) => t.id !== tour.id && t.category === tour.category).slice(0, 3)

  return (
    <SiteChrome>
      <TourDetailJsonLd
        tour={tour}
        images={detail.gallery.map((image) => image.src)}
        availability={detail.availability}
      />

      <PageHero
        eyebrow={`${tour.country} · ${tour.category}`}
        title={tour.title}
        breadcrumb={tour.title}
        image={tour.image}
      />

      <section className="bg-background py-16 lg:py-20">
        <div className="container-mv grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-14">
            <Reveal>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                  <Clock className="size-4 text-royal" /> {tour.duration}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                  <MapPin className="size-4 text-royal" /> Khởi hành: {tour.departure}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                  <CalendarDays className="size-4 text-royal" /> Gần nhất: {tour.date}
                </span>
              </div>

              <div className="mt-8">
                <TourGallery images={detail.gallery} title={tour.title} />
              </div>
            </Reveal>

            <Reveal>
              <h2 className="font-display text-2xl font-bold text-foreground">Lịch trình chi tiết</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Lịch trình tham khảo — chuyên viên Minh Việt sẽ xác nhận chi tiết cuối cùng theo ngày khởi hành thực tế.
              </p>
              <div className="mt-6">
                <TourItinerary days={detail.itinerary} />
              </div>
            </Reveal>

            <Reveal>
              <h2 className="font-display text-2xl font-bold text-foreground">Bao gồm / Không bao gồm</h2>
              <div className="mt-6">
                <TourInclusions inclusions={detail.inclusions} exclusions={detail.exclusions} />
              </div>
            </Reveal>

            <Reveal>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Chính sách thanh toán &amp; hoàn hủy
              </h2>
              <div className="mt-6">
                <TourPolicy
                  paymentPolicy={standardPaymentPolicy}
                  cancellationPolicy={standardCancellationPolicy}
                  cancellationNote={cancellationPolicyNote}
                />
              </div>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <TourBookingCard tour={tour} priceType={detail.priceType} availability={detail.availability} />
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-16 lg:py-20">
          <div className="container-mv">
            <h2 className="font-display text-2xl font-bold text-foreground">Hành trình liên quan</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <RelatedTourCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteChrome>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { getPublicSupabaseClient } from '@/shared/supabase/public-client'
import { loadPublicTourDetail, listRelatedTourCards } from '@/lib/tours/public-tours'
import { formatTourDate } from '@/lib/tours/format'
import { standardPaymentPolicy, standardCancellationPolicy, cancellationPolicyNote } from '@/lib/tours/policy-content'
import { resolveDefaultSeoMetadata } from '@/lib/seo/default-metadata'
import { resolveMediaImageUrl } from '@/lib/seo/resolve-media-image'
import { SiteChrome } from '@/components/site/site-chrome'
import { PageHero } from '@/components/site/page-hero'
import { TourGallery } from '@/components/site/tour-detail/gallery'
import { TourItinerary } from '@/components/site/tour-detail/itinerary'
import { TourInclusions } from '@/components/site/tour-detail/inclusions'
import { TourPolicy } from '@/components/site/tour-detail/policy'
import { TourBookingCard } from '@/components/site/tour-detail/booking-card'
import { TourCard } from '@/components/site/tour-card'
import { Reveal } from '@/components/mv/reveal'
import { TourDetailJsonLd } from '@/components/seo/json-ld'

const RELATED_LIMIT = 3

async function loadTour(slug: string) {
  const client = getPublicSupabaseClient()
  const tour = await loadPublicTourDetail(client, slug)
  if (!tour) return null
  const related = await listRelatedTourCards(client, tour.categoryNames, tour.pageId, RELATED_LIMIT)
  return { client, tour, related }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadTour(slug)
  if (!loaded) return {}
  const { client, tour } = loaded
  const fallback = await resolveDefaultSeoMetadata(client, tour.title)
  const canonicalPath = `/tour/${slug}`
  const canonicalUrl = `${fallback.canonicalBaseUrl}${canonicalPath}`
  const description = `${tour.duration ? `${tour.duration} · ` : ''}${tour.departureCity ? `Khởi hành từ ${tour.departureCity}. ` : ''}${tour.body}`.trim()
  const heroImage = tour.gallery[0]?.src

  if (!tour.seoMetadataId) {
    return {
      title: fallback.title,
      description: description || fallback.description,
      robots: fallback.robots,
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: `${tour.title} | Minh Việt Travel`,
        description: description || fallback.description,
        url: canonicalUrl,
        siteName: fallback.siteName,
        type: 'website',
        images: heroImage ? [{ url: heroImage }] : undefined,
      },
      twitter: { card: fallback.twitterCard as 'summary_large_image' },
    }
  }

  const { data: seoRow } = await client
    .from('seo_metadata')
    .select('title, meta_description, canonical_url, og_title, og_description, is_indexed, is_followed, og_image_media_id')
    .eq('id', tour.seoMetadataId)
    .maybeSingle()
  const row = seoRow as {
    title?: string
    meta_description?: string
    canonical_url?: string | null
    og_title?: string
    og_description?: string
    is_indexed?: boolean
    is_followed?: boolean
    og_image_media_id?: string | null
  } | null
  const title = row?.title ?? `${tour.title} | Minh Việt Travel`
  const metaDescription = row?.meta_description ?? description ?? undefined
  const robots = row ? `${row.is_indexed === false ? 'noindex' : 'index'}, ${row.is_followed === false ? 'nofollow' : 'follow'}` : fallback.robots
  const resolvedCanonicalUrl = row?.canonical_url || canonicalUrl
  const ogImage = (await resolveMediaImageUrl(client, row?.og_image_media_id)) ?? heroImage ?? fallback.ogImage

  return {
    title,
    description: metaDescription,
    robots,
    alternates: { canonical: resolvedCanonicalUrl },
    openGraph: {
      title: row?.og_title ?? title,
      description: row?.og_description ?? metaDescription,
      url: resolvedCanonicalUrl,
      siteName: fallback.siteName,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: fallback.twitterCard as 'summary_large_image' },
  }
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const loaded = await loadTour(slug)
  if (!loaded) notFound()
  const { tour, related } = loaded

  return (
    <SiteChrome>
      <TourDetailJsonLd tour={tour} />

      <PageHero
        eyebrow={[tour.country, tour.categoryNames[0]].filter(Boolean).join(' · ') || 'Hành trình'}
        title={tour.title}
        breadcrumb={tour.title}
        image={tour.gallery[0]?.src}
      />

      <section className="bg-background py-16 lg:py-20">
        <div className="container-mv grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-14">
            <Reveal>
              <div className="flex flex-wrap gap-3 text-sm">
                {tour.duration && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                    <Clock className="size-4 text-royal" /> {tour.duration}
                  </span>
                )}
                {tour.departureCity && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                    <MapPin className="size-4 text-royal" /> Khởi hành: {tour.departureCity}
                  </span>
                )}
                {tour.departureDate && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-foreground">
                    <CalendarDays className="size-4 text-royal" /> Gần nhất: {formatTourDate(tour.departureDate)}
                  </span>
                )}
              </div>

              {tour.body && <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground">{tour.body}</p>}

              {tour.gallery.length > 0 && (
                <div className="mt-8">
                  <TourGallery images={tour.gallery} title={tour.title} />
                </div>
              )}
            </Reveal>

            {tour.itinerary.length > 0 && (
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-foreground">Lịch trình chi tiết</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Lịch trình tham khảo — chuyên viên Minh Việt sẽ xác nhận chi tiết cuối cùng theo ngày khởi hành thực tế.
                </p>
                <div className="mt-6">
                  <TourItinerary days={tour.itinerary} />
                </div>
              </Reveal>
            )}

            {(tour.inclusions.length > 0 || tour.exclusions.length > 0) && (
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-foreground">Bao gồm / Không bao gồm</h2>
                <div className="mt-6">
                  <TourInclusions inclusions={tour.inclusions} exclusions={tour.exclusions} />
                </div>
              </Reveal>
            )}

            <Reveal>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Chính sách thanh toán &amp; hoàn hủy
              </h2>
              <div className="mt-6">
                <TourPolicy
                  paymentPolicy={standardPaymentPolicy}
                  cancellationPolicy={standardCancellationPolicy}
                  cancellationNote={tour.cancellationNote || cancellationPolicyNote}
                />
              </div>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <TourBookingCard tour={tour} />
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-16 lg:py-20">
          <div className="container-mv">
            <h2 className="font-display text-2xl font-bold text-foreground">Hành trình liên quan</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <TourCard key={t.pageId} tour={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteChrome>
  )
}

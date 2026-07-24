import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { HomepageInspirationResolution } from '@/lib/inspiration/inspiration-demo-data'
import { FeaturedInspirationVideo } from '@/components/homepage/featured-inspiration-video'
import { SupportingInspirationCarousel } from '@/components/homepage/supporting-inspiration-carousel'

/**
 * Right column of the Consultation + Inspiration section. Takes the
 * already-resolved `featured`/`supporting` items (see
 * `getHomepageInspiration()`) — this component never touches the raw
 * curator config or filters by status/publish window itself, so it stays
 * correct regardless of where the data ends up coming from later.
 */
export function TravelInspirationHub({
  sectionTitle,
  sectionSubtitle,
  featured,
  supporting,
}: HomepageInspirationResolution) {
  return (
    <div>
      <p className="eyebrow text-[11px] font-semibold text-mv-sky-cyan">
        {sectionTitle} — {sectionSubtitle}
      </p>

      <div className="mt-4">
        {featured ? (
          <FeaturedInspirationVideo item={featured} />
        ) : (
          <div className="relative overflow-hidden rounded-2xl shadow-soft-lg">
            <div className="relative aspect-video w-full">
              <Image
                src="/editorial-hero.webp"
                alt="Minh Việt Travel"
                fill
                sizes="(min-width: 1024px) 54vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/90 via-mv-deep-navy/40 to-mv-deep-navy/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <h2 className="max-w-md text-balance font-display text-2xl font-bold leading-tight text-white">
                  Những câu chuyện hành trình đang được cập nhật.
                </h2>
                <Link
                  href="/tours"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-mv-sky-cyan hover:text-white"
                >
                  Khám phá tour đang mở
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {supporting.length > 0 && (
        <div className="mt-5">
          <SupportingInspirationCarousel items={supporting} />
        </div>
      )}
    </div>
  )
}

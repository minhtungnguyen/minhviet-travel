import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AvailabilityBadge } from '@/components/homepage/availability-badge'
import type { JourneyContent } from '@/types/homepage'
import type { TourCardViewModel } from '@/types/tour-availability'

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫'
}

function formatDepartureDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * "Tour Availability As Logical Sales Signal" — the card no longer owns
 * an availability opinion. It renders exactly what
 * `buildTourCardViewModel()` (lib/tours/availability.ts) resolved: the
 * badge, the meta line's date/departure-point, and the CTA all come from
 * `viewModel.primaryDeparture`/`.availability`/`.cta`, never from a flat
 * per-tour status. See TOUR_AVAILABILITY_SALES_SIGNAL.md.
 */
export function JourneyCard({ viewModel }: { viewModel: TourCardViewModel<JourneyContent> }) {
  const { tour: journey, primaryDeparture, availability, cta } = viewModel

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-transparent bg-card shadow-soft transition-all duration-mv-normal ease-mv-standard hover:border-mv-sky-cyan hover:shadow-soft-lg">
      <Link href={journey.href} className="relative block aspect-[16/11] overflow-hidden">
        <Image
          src={journey.image.src}
          alt={journey.image.alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
        />
        <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)]">
          <AvailabilityBadge availability={availability} />
        </span>
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-mv-deep-navy/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          <Clock className="size-3.5" /> {journey.duration}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <span className="eyebrow text-[10px] text-mv-journey-blue">{journey.country}</span>

        <h3 className="mt-1.5 line-clamp-2 text-pretty font-display text-xl font-bold leading-snug text-mv-deep-navy transition-colors group-hover:text-mv-journey-blue">
          <Link href={journey.href}>{journey.title}</Link>
        </h3>

        <p className="mt-2 text-xs text-mv-slate">
          {primaryDeparture
            ? `Khởi hành ${formatDepartureDate(primaryDeparture.departureDate)} · Điểm đi ${primaryDeparture.departurePoint}`
            : 'Lịch khởi hành đang được cập nhật'}
          {journey.reviewScore && journey.reviewCount
            ? ` · ${journey.reviewScore.toFixed(1)}/5 (${journey.reviewCount} đánh giá)`
            : null}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-mv-border-soft pt-3">
          <div>
            <p className="eyebrow text-[10px] text-mv-slate">
              {journey.priceType === 'estimate' ? 'Giá tham khảo' : 'Giá'}
            </p>
            <p className="text-base font-bold text-mv-journey-blue">{formatPrice(journey.priceFrom)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-mv-border-soft hover:border-mv-sky-cyan"
            render={<Link href={cta.href} />}
          >
            {cta.label}
          </Button>
        </div>
      </div>
    </article>
  )
}

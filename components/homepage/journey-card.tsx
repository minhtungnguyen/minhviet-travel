import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AvailabilityStatus } from '@/types/cms'
import type { JourneyContent } from '@/types/homepage'

/**
 * Availability is always one of Volume 02 Ch.10.3's approved status
 * labels — never an invented seat counter or countdown. Fixes the
 * audit's "fake scarcity" finding in the previous tour card.
 */
const AVAILABILITY_COPY: Record<AvailabilityStatus, { label: string; variant: 'success' | 'warning' | 'neutral' | 'info' }> = {
  open: { label: 'Còn nhận khách', variant: 'success' },
  limited: { label: 'Sắp hết chỗ', variant: 'warning' },
  'almost-full': { label: 'Gần kín', variant: 'warning' },
  closed: { label: 'Hết chỗ', variant: 'neutral' },
  'pending-confirmation': { label: 'Chờ xác nhận', variant: 'info' },
}

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + '₫'
}

/**
 * Redesigned away from the Traveloka/Klook shape (floating rating
 * badge, dense icon-per-line meta, price as the loudest element) —
 * the image and the journey title carry the card, meta collapses to
 * one line, price is present but subordinate. Data contract unchanged.
 */
export function JourneyCard({ journey }: { journey: JourneyContent }) {
  const availability = AVAILABILITY_COPY[journey.availability]

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
        <span className="absolute left-4 top-4">
          <Badge variant={availability.variant}>{availability.label}</Badge>
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
          Khởi hành {journey.nextDeparture} · Điểm đi {journey.departure}
          {journey.reviewScore && journey.reviewCount
            ? ` · ${journey.reviewScore.toFixed(1)}/5 (${journey.reviewCount} đánh giá)`
            : null}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-mv-border-soft pt-3">
          <div>
            <p className="eyebrow text-[10px] text-mv-slate">
              {journey.priceType === 'estimate' ? 'Giá tham khảo' : 'Giá'}
            </p>
            <p className="text-base font-bold text-mv-journey-blue">{formatPrice(journey.priceFrom)}</p>
          </div>
          <Button variant="outline" size="sm" className="border-mv-border-soft hover:border-mv-sky-cyan" render={<Link href={journey.href} />}>
            Khám phá tour
          </Button>
        </div>
      </div>
    </article>
  )
}

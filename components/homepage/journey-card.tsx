import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock, MapPin, Star } from 'lucide-react'
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

export function JourneyCard({ journey }: { journey: JourneyContent }) {
  const availability = AVAILABILITY_COPY[journey.availability]

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link href={journey.href} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={journey.image.src}
          alt={journey.image.alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4">
          <Badge variant={availability.variant}>{availability.label}</Badge>
        </span>
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-deep/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          <Clock className="size-3.5" /> {journey.duration}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-[10px] text-primary">{journey.country}</span>
          {journey.reviewScore && journey.reviewCount ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <Star className="size-3.5 fill-gold text-gold" />
              {journey.reviewScore.toFixed(1)}
              <span className="text-muted-foreground">({journey.reviewCount})</span>
            </span>
          ) : null}
        </div>

        <h3 className="mt-2.5 line-clamp-2 text-pretty font-display text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          <Link href={journey.href}>{journey.title}</Link>
        </h3>

        <ul className="mt-3.5 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0 text-royal/70" />
            Khởi hành gần nhất: <span className="font-medium text-foreground">{journey.nextDeparture}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-royal/70" />
            Điểm đi: <span className="font-medium text-foreground">{journey.departure}</span>
          </li>
        </ul>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="eyebrow text-[10px] text-muted-foreground">
              {journey.priceType === 'estimate' ? 'Giá tham khảo' : 'Giá'}
            </p>
            <p className="text-xl font-extrabold text-primary">{formatPrice(journey.priceFrom)}</p>
            {journey.priceType === 'estimate' && (
              <p className="text-[11px] text-muted-foreground">Xác nhận khi đặt chỗ</p>
            )}
          </div>
          <Button variant="outline" size="sm" render={<Link href={journey.href} />}>
            Xem hành trình
          </Button>
        </div>
      </div>
    </article>
  )
}

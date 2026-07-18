import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'
import type { Tour } from '@/lib/site-data'
import { getTourDetailContent } from '@/lib/tours/tour-detail-content'
import { MVButton } from '@/components/mv/mv-button'
import { Badge } from '@/components/ui/badge'
import type { AvailabilityStatus } from '@/types/cms'

/**
 * Deliberately not `components/site/tour-card.tsx` — that component still
 * shows the crossed-out original price / discount badge / fake seat
 * counter pattern used by the (out-of-scope) `/tours` listing page. This
 * "related tours" card only shows fields that are honest without a real
 * CMS/inventory system behind them yet — see PROJECT_AUDIT.md §3.2/§3.3.
 */
const AVAILABILITY_COPY: Record<AvailabilityStatus, { label: string; variant: 'success' | 'warning' | 'neutral' | 'info' }> = {
  open: { label: 'Còn nhận khách', variant: 'success' },
  limited: { label: 'Sắp hết chỗ', variant: 'warning' },
  'almost-full': { label: 'Gần kín', variant: 'warning' },
  closed: { label: 'Hết chỗ', variant: 'neutral' },
  'pending-confirmation': { label: 'Chờ xác nhận', variant: 'info' },
}

export function RelatedTourCard({ tour }: { tour: Tour }) {
  const detail = getTourDetailContent(tour.id)
  const availability = detail ? AVAILABILITY_COPY[detail.availability] : null

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link href={`/tour/${tour.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={tour.image}
          alt={tour.title}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        {availability && (
          <span className="absolute left-4 top-4">
            <Badge variant={availability.variant}>{availability.label}</Badge>
          </span>
        )}
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-deep/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          <Clock className="size-3.5" /> {tour.duration}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <span className="eyebrow text-[10px] text-primary">{tour.country}</span>
        <h3 className="mt-2 line-clamp-2 text-pretty font-display text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
          <Link href={`/tour/${tour.id}`}>{tour.title}</Link>
        </h3>

        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-royal/70" />
            Điểm đi: <span className="font-medium text-foreground">{tour.departure}</span>
          </li>
        </ul>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="eyebrow text-[10px] text-muted-foreground">
              {detail?.priceType === 'confirmed' ? 'Giá' : 'Giá tham khảo'}
            </p>
            <p className="text-xl font-extrabold text-primary">{tour.price}</p>
          </div>
          <MVButton href={`/tour/${tour.id}`} variant="outline" size="sm">
            Xem hành trình
          </MVButton>
        </div>
      </div>
    </article>
  )
}

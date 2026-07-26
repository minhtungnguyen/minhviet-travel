import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, CalendarDays, Users, Star } from 'lucide-react'
import type { Tour } from '@/lib/site-data'
import { MVButton } from '@/components/mv/mv-button'

export function TourCard({ tour }: { tour: Tour }) {
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
        {tour.featured ? (
          <span className="absolute left-4 top-4 eyebrow rounded-full bg-gold px-3 py-1.5 text-[10px] font-semibold text-deep shadow-md">
            Bán chạy
          </span>
        ) : null}
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-deep/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          <Clock className="size-3.5" /> {tour.duration}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-[10px] text-primary">{tour.country}</span>
          {tour.rating ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
              <Star className="size-3.5 fill-gold text-gold" />
              {tour.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 line-clamp-2 text-pretty font-display text-lg leading-snug text-foreground transition-colors group-hover:text-primary">
          <Link href={`/tour/${tour.id}`}>{tour.title}</Link>
        </h3>

        <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0 text-royal/70" />
            Khởi hành: <span className="font-medium text-foreground">{tour.date}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-royal/70" />
            Điểm đi: <span className="font-medium text-foreground">{tour.departure}</span>
          </li>
          <li className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0 text-royal/70" />
            <span className="font-medium text-foreground">{tour.seats}</span>
          </li>
        </ul>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="eyebrow text-[10px] text-muted-foreground">Giá từ</p>
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

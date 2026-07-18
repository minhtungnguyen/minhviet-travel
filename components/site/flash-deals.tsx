'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Flame, ArrowRight } from 'lucide-react'
import { flashDeals } from '@/lib/site-data'
import { MVButton } from '@/components/mv/mv-button'

function useCountdown(hoursFromNow: number) {
  const [remaining, setRemaining] = useState(hoursFromNow * 3600)

  useEffect(() => {
    const target = Date.now() + hoursFromNow * 3600 * 1000
    const tick = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000))
      setRemaining(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [hoursFromNow])

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return { h: pad(h), m: pad(m), s: pad(s) }
}

function CountdownBadge({ hours }: { hours: number }) {
  const { h, m, s } = useCountdown(hours)
  return (
    <span className="flex items-center gap-1 font-mono text-xs font-bold tabular-nums text-white">
      <Clock className="size-3.5" />
      {h}:{m}:{s}
    </span>
  )
}

export function FlashDeals() {
  return (
    <section className="bg-secondary/50 py-24 lg:py-32">
      <div className="container-mv">
        <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 text-accent">
              <Flame className="size-4" /> Ưu đãi giờ chót
            </span>
            <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl font-bold leading-tight tracking-tight text-foreground lg:text-4xl">
              Giá tốt nhất trong ngày, <span className="text-accent">số lượng có hạn</span>
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
              Khám phá thế giới, nghỉ dưỡng cao cấp, trải nghiệm trọn vẹn với mức giá tối ưu nhất — nhanh tay trước khi hết giờ.
            </p>
          </div>
          <MVButton href="/tours?deal=flash" variant="outline" size="md" className="hidden shrink-0 md:inline-flex">
            Xem tất cả <ArrowRight className="size-4" />
          </MVButton>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flashDeals.map((deal) => (
            <article
              key={deal.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <Link href={`/tour/${deal.id}`} className="relative block aspect-[4/3] overflow-hidden">
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <span className="absolute left-0 top-4 rounded-r-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md">
                  -{deal.discount}%
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-deep/85 px-3 py-2 backdrop-blur">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-white/70">
                    Kết thúc sau
                  </span>
                  <CountdownBadge hours={deal.endsInHours} />
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-pretty font-display text-base leading-snug text-foreground transition-colors group-hover:text-primary">
                  <Link href={`/tour/${deal.id}`}>{deal.title}</Link>
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">{deal.code}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {deal.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {deal.departure}
                  </span>
                </div>

                <div className="mt-auto flex items-end justify-between pt-4">
                  <div>
                    <p className="text-[11px] text-muted-foreground line-through">{deal.originalPrice}</p>
                    <p className="text-xl font-extrabold text-primary">{deal.price}</p>
                  </div>
                  <span className="rounded-sm bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive">
                    {deal.seats}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

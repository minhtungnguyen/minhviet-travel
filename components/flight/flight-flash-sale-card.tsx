import Image from 'next/image'
import Link from 'next/link'
import { PlaneTakeoff, Clock3 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import type { CmsImage } from '@/types/cms'

export function FlightFlashSaleCard({
  title,
  originLabel,
  destinationLabel,
  priceFrom,
  currency,
  validUntil,
  image,
  href,
}: {
  title: string
  originLabel: string
  destinationLabel: string
  priceFrom: number
  currency: string
  validUntil: string
  image: CmsImage
  href: string
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-mv-normal hover:-translate-y-1 hover:shadow-soft-lg">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1280px) 23vw, (min-width: 640px) 45vw, 85vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 eyebrow rounded-full bg-mv-offer-red px-3 py-1.5 text-[10px] font-semibold text-white shadow-md">
          Ưu đãi
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-pretty font-display text-base leading-snug text-foreground">
          <Link href={href} className="transition-colors hover:text-mv-journey-blue">
            {title}
          </Link>
        </h3>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <PlaneTakeoff className="size-3.5 shrink-0 text-mv-journey-blue" />
          <span className="font-medium text-foreground">{originLabel}</span>
          <span aria-hidden>→</span>
          <span className="font-medium text-foreground">{destinationLabel}</span>
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5 shrink-0 text-mv-journey-blue" />
          Hạn đến {new Date(validUntil).toLocaleDateString('vi-VN')}
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="eyebrow text-[10px] text-muted-foreground">Giá từ</p>
            <p className="text-lg font-extrabold text-mv-journey-blue">
              {priceFrom.toLocaleString('vi-VN')} {currency}
            </p>
          </div>
          <MVButton href={href} variant="outline" size="sm">
            Xem chi tiết
          </MVButton>
        </div>
      </div>
    </article>
  )
}

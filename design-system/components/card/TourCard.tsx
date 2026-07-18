import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardBaseClass } from './_shared'

export type TourCardMeta = { icon?: LucideIcon; label: string }

export type TourCardProps = {
  href: string
  image: string
  imageAlt: string
  title: string
  meta?: TourCardMeta[]
  price?: string
  priceLabel?: string
  originalPrice?: string
  badge?: string
  ctaLabel?: string
  className?: string
}

/** Generic itinerary/product card: image, title, metadata row, price, single CTA. */
export function TourCard({
  href,
  image,
  imageAlt,
  title,
  meta = [],
  price,
  priceLabel = 'Từ',
  originalPrice,
  badge,
  ctaLabel = 'Xem chi tiết',
  className,
}: TourCardProps) {
  return (
    <article className={cn(cardBaseClass, className)}>
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="ds-transition object-cover group-hover:opacity-95"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-ds-full bg-ds-surface-base px-3 py-1 text-xs font-semibold text-ds-text-primary shadow-ds-soft">
            {badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-ds-heading text-base font-semibold text-ds-text-primary">
          <Link href={href} className="ds-transition hover:text-ds-interactive-default">
            {title}
          </Link>
        </h3>

        {meta.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-ds-text-secondary">
            {meta.map((m, i) => {
              const Icon = m.icon
              return (
                <li key={i} className="flex items-center gap-2">
                  {Icon && <Icon className="size-3.5 shrink-0 text-ds-text-muted" />}
                  {m.label}
                </li>
              )
            })}
          </ul>
        )}

        {price && (
          <div className="mt-4 flex items-end justify-between border-t border-ds-border-subtle pt-4">
            <div>
              {originalPrice && (
                <p className="text-xs text-ds-text-muted line-through">{originalPrice}</p>
              )}
              <p className="text-[11px] uppercase tracking-wide text-ds-text-muted">{priceLabel}</p>
              <p className="font-ds-heading text-lg font-bold text-ds-text-primary">{price}</p>
            </div>
            <Link
              href={href}
              className="ds-transition text-sm font-semibold text-ds-interactive-default hover:text-ds-interactive-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatVnd } from '@/lib/flight/flight-format'
import { MVButton } from '@/components/mv/mv-button'
import type { ComboItem } from '@/types/combo'

/**
 * Shared between Section 01's featured+secondary grid and the
 * `/combo/tat-ca` full listing — one card, one visual language, per the
 * brief's "Reuse Component tối đa." Card only ever shows image, title,
 * summary, price-from, and a CTA — never inventory/room-type/availability.
 */
export function ComboCard({ combo, featured = false }: { combo: ComboItem; featured?: boolean }) {
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-mv-normal hover:-translate-y-1 hover:shadow-soft-lg',
        featured ? 'flex flex-col lg:flex-row' : 'flex h-full flex-col',
      )}
    >
      <Link
        href={combo.cta.href}
        className={cn(
          'relative block overflow-hidden',
          featured ? 'aspect-[16/10] lg:aspect-auto lg:w-1/2' : 'aspect-[4/3]',
        )}
      >
        <Image
          src={combo.thumbnail.src}
          alt={combo.thumbnail.alt}
          fill
          sizes={featured ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw'}
          className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-105"
        />
      </Link>

      <div className={cn('flex flex-1 flex-col p-5', featured && 'lg:w-1/2 lg:justify-center lg:p-9')}>
        <p className="text-xs font-medium text-muted-foreground">{combo.destination}</p>
        <h3
          className={cn(
            'mt-2 text-pretty font-display leading-snug text-foreground',
            featured ? 'text-2xl lg:text-[1.75rem]' : 'line-clamp-2 text-base',
          )}
        >
          <Link href={combo.cta.href} className="transition-colors hover:text-mv-journey-blue">
            {combo.title}
          </Link>
        </h3>
        <p
          className={cn(
            'mt-2 text-muted-foreground',
            featured ? 'text-base leading-relaxed' : 'line-clamp-2 text-sm',
          )}
        >
          {combo.summary}
        </p>

        {combo.highlights.length > 0 && (
          <p
            className={cn(
              'mt-3 text-xs text-mv-journey-blue',
              featured ? 'text-sm' : 'line-clamp-1',
            )}
          >
            {combo.highlights.join('  ·  ')}
          </p>
        )}

        <div className={cn('mt-4 flex items-center justify-between gap-3 pt-1', !featured && 'mt-auto')}>
          <p className="text-sm text-muted-foreground">
            Giá từ{' '}
            <span className="font-display text-lg font-bold text-mv-deep-navy">{formatVnd(combo.priceFrom)}</span>
          </p>
          {featured ? (
            <MVButton href={combo.cta.href} variant="accent" size="sm">
              {combo.cta.label} <ArrowRight className="size-4" />
            </MVButton>
          ) : (
            <Link
              href={combo.cta.href}
              className="link-underline inline-flex items-center gap-1.5 text-sm font-semibold text-mv-journey-blue"
            >
              {combo.cta.label} <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

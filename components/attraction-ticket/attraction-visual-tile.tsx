import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Same photo-tile DNA as `components/combo/combo-visual-tile.tsx` (image +
 * bottom gradient + caption, hover scale) — kept local to this module
 * rather than importing Combo's version, same reasoning Combo itself used
 * for not modifying the shared homepage `destination-card.tsx`: each
 * commerce module owns its own tile so one module's changes never risk
 * another's rendering.
 *
 * Shared by 2 of the 3 canonical card types (docs/design/mv-ticket/02-
 * homepage-and-listing-concept.md §3, D10): `variant="destination"`
 * (default) is the Destination Tile, `variant="brand"` is the Venue/Brand
 * Tile — a smaller "logo trust" tile, not an emotional photo, so it gets a
 * tighter aspect ratio and no subtitle/meta clutter. One component, two
 * presets, not a 4th card type.
 */
export function AttractionVisualTile({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  meta,
  href,
  variant = 'destination',
}: {
  imageUrl: string
  imageAlt: string
  title: string
  subtitle?: string
  meta?: string
  href: string
  variant?: 'destination' | 'brand'
}) {
  const isBrand = variant === 'brand'

  return (
    <Link
      href={href}
      className={cn(
        'group relative block overflow-hidden rounded-2xl shadow-soft',
        isBrand ? 'aspect-[4/3]' : 'aspect-[16/10]',
      )}
    >
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        sizes="(min-width: 1024px) 32vw, 100vw"
        className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/85 via-mv-deep-navy/10 to-transparent transition-colors duration-mv-normal group-hover:from-mv-brand-blue/80" />
      <div className={cn('absolute inset-x-0 bottom-0', isBrand ? 'p-4' : 'p-5')}>
        <h3 className={cn('font-display text-paper', isBrand ? 'text-lg font-bold' : 'text-2xl')}>{title}</h3>
        {!isBrand && subtitle && <p className="mt-1 text-sm text-paper/70">{subtitle}</p>}
        {meta && <p className="mt-2 eyebrow text-[10px] text-paper/60">{meta}</p>}
      </div>
    </Link>
  )
}

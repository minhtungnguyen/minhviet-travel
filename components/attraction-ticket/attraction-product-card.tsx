import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatVnd } from '@/lib/flight/flight-format'
import { MVButton } from '@/components/mv/mv-button'
import { AttractionCardTrustToggle } from '@/components/attraction-ticket/attraction-card-trust-toggle'

/**
 * The ONE canonical Product Card (D10, docs/design/mv-ticket/02-homepage-
 * and-listing-concept.md §3) — Concept 4 "Experience Commerce Card",
 * approved 2026-07-28. Exactly 3 layouts on this single component, no
 * separate components per context:
 *   - `experience` (default) — Homepage rails (Được đề xuất, Category,
 *     Best Seller, Family Picks): full-bleed image, info overlaid.
 *   - `horizontal` — Listing/Category grid on tablet+desktop: image left,
 *     content right. Below the `sm:` breakpoint this same markup restyles
 *     itself into a denser row (smaller thumbnail, 1-line title, icon-only
 *     CTA) — that IS "Compact Commerce Card" (#6 of the 2026-07-28
 *     decisions): not a 4th layout value, the horizontal layout's own
 *     responsive state. See docs/design/mv-ticket/DESIGN-BIBLE-v1.0.md.
 *
 * Badge is a single standardized slot (#9): 'featured' (is_featured) beats
 * 'new' (created within 30 days) beats nothing — both computed from real
 * columns, never fabricated. Sold Out/Limited/Best Seller/Flash Sale
 * states exist in the design (docs/design/mv-ticket/12-design-rules.md
 * #98) but are NOT wired here because no real-time per-card availability,
 * original-price, or sales-count data source exists yet — adding them
 * without real data would be exactly the "decorative badge" this project
 * has repeatedly ruled out.
 */
export type AttractionProductCardViewModel = {
  slug: string
  destinationSlug: string
  title: string
  summary: string
  imageUrl: string
  imageAlt: string
  venueName: string
  destinationName: string
  priceFrom: number | null
  isFeatured: boolean
  createdAt: string
  /** First category name assigned to this product, if any (attraction_product_categories) — real taxonomy, not invented. */
  experienceTag?: string | null
  /** Slug of the same category `experienceTag` names — lets callers build a real `?category=` filter link instead of matching on display text. */
  experienceCategorySlug?: string | null
  /** No rating data source exists yet (no review table) — always undefined today. Slot reserved, never rendered with a placeholder value. */
  rating?: { value: number; count: number }
}

const NEW_WINDOW_DAYS = 30

function resolveBadge(product: AttractionProductCardViewModel): { label: string } | null {
  if (product.isFeatured) return { label: 'Được đề xuất' }
  const ageDays = (Date.now() - Date.parse(product.createdAt)) / (1000 * 60 * 60 * 24)
  if (Number.isFinite(ageDays) && ageDays >= 0 && ageDays <= NEW_WINDOW_DAYS) return { label: 'Mới ra mắt' }
  return null
}

function venueInitials(venueName: string): string {
  const words = venueName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  return (words[0][0] + (words[1]?.[0] ?? '')).toUpperCase()
}

const TRUST_LINES = ['Vé điện tử tức thì', 'Xác nhận nhanh', 'Chính sách huỷ rõ ràng']

export function AttractionProductCard({
  product,
  layout = 'experience',
  size = 'md',
}: {
  product: AttractionProductCardViewModel
  layout?: 'experience' | 'horizontal'
  size?: 'md' | 'lg'
}) {
  const href = `/ve-vui-choi/${product.destinationSlug}/${product.slug}`
  const badge = resolveBadge(product)
  const isLarge = size === 'lg'
  const ctaLabel = layout === 'horizontal' ? 'Xem chi tiết' : 'Đặt ngay'

  if (layout === 'horizontal') {
    return (
      <article className="group flex overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-mv-normal hover:-translate-y-0.5 hover:shadow-soft-lg">
        <Link href={href} className="relative block aspect-square w-28 shrink-0 overflow-hidden sm:w-40">
          <Image src={product.imageUrl} alt={product.imageAlt} fill sizes="(min-width: 640px) 160px, 112px" className="object-cover" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 sm:gap-1.5 sm:p-4">
          <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">
            {product.venueName} · {product.destinationName}
          </p>
          <h3 className="truncate font-display text-sm font-bold text-foreground sm:line-clamp-2 sm:text-base">
            <Link href={href} className="transition-colors hover:text-mv-journey-blue">
              {product.title}
            </Link>
          </h3>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="font-display text-sm font-extrabold text-mv-ticket-orange sm:text-lg">
              {product.priceFrom !== null ? formatVnd(product.priceFrom) : 'Liên hệ'}
            </span>
            <MVButton
              href={href}
              variant="accent"
              size="sm"
              className="h-8 bg-mv-ticket-orange px-2.5 text-xs hover:bg-mv-ticket-orange/90 sm:h-9 sm:px-4 sm:text-sm"
            >
              <span className="hidden sm:inline">{ctaLabel}</span>
              <ArrowRight className="size-3.5 sm:size-4" />
            </MVButton>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-mv-normal hover:-translate-y-1 hover:shadow-soft-lg',
        isLarge ? 'aspect-[16/11] sm:aspect-[3/2]' : 'aspect-[3/4]',
      )}
    >
      <Link href={href} className="absolute inset-0">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          sizes={isLarge ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 85vw'}
          className="object-cover transition-transform duration-mv-slow ease-mv-standard group-hover:scale-105"
        />
      </Link>

      <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
        {product.venueName ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/95 text-[11px] font-extrabold text-mv-deep-navy">
            {venueInitials(product.venueName)}
          </span>
        ) : (
          <span />
        )}
        {product.experienceTag && (
          <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-bold text-mv-deep-navy">{product.experienceTag}</span>
        )}
      </div>

      {badge && (
        <span className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-mv-ticket-orange-light px-2.5 py-1 text-[10px] font-bold text-mv-ticket-orange sm:top-3">
          {badge.label}
        </span>
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-mv-deep-navy/95 via-mv-deep-navy/40 to-transparent p-3 sm:p-4">
        {/* Trust reveal: CSS group-hover on devices that support real hover
            (desktop), a tap toggle (peer + aria-expanded) elsewhere
            (mobile/tablet touch) — see attraction-card-trust-toggle.tsx and
            docs/design/mv-ticket/09-motion-guideline.md. */}
        <div className="pointer-events-auto mb-1.5 flex justify-end [@media(hover:hover)]:hidden">
          <AttractionCardTrustToggle className="peer" />
        </div>
        <ul
          className={cn(
            'mb-1.5 flex flex-col gap-0.5 text-[11px] text-paper/90 opacity-0 transition-opacity duration-mv-normal',
            '[@media(hover:hover)]:group-hover:opacity-100 peer-aria-expanded:opacity-100',
          )}
        >
          {TRUST_LINES.map((line) => (
            <li key={line} className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 shrink-0 text-mv-ticket-orange-light" />
              {line}
            </li>
          ))}
        </ul>

        <p className="truncate text-[11px] text-paper/70">{product.destinationName}</p>
        <h3 className={cn('mt-0.5 text-pretty font-display font-bold text-paper', isLarge ? 'text-xl sm:text-2xl' : 'line-clamp-2 text-sm sm:text-base')}>
          <Link href={href} className="pointer-events-auto">
            {product.title}
          </Link>
        </h3>
        {product.rating && (
          <p className="mt-1 flex items-center gap-1 text-xs text-paper/85">
            <Star className="size-3.5 fill-gold text-gold" />
            <span className="font-semibold">{product.rating.value.toFixed(1)}</span>
            <span>({product.rating.count})</span>
          </p>
        )}

        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="leading-tight">
            <span className="block text-[10px] text-paper/70">Giá từ</span>
            <span className={cn('font-display font-extrabold text-paper', isLarge ? 'text-2xl' : 'text-lg')}>
              {product.priceFrom !== null ? formatVnd(product.priceFrom) : 'Liên hệ'}
            </span>
          </p>
          <MVButton
            href={href}
            variant="accent"
            size="sm"
            className="pointer-events-auto bg-mv-ticket-orange hover:bg-mv-ticket-orange/90"
          >
            {ctaLabel} <ArrowRight className="size-4" />
          </MVButton>
        </div>
      </div>
    </article>
  )
}

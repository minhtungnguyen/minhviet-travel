import { cn } from '@/lib/utils'
import type { DerivedAvailability, TourAvailabilityStatus } from '@/types/tour-availability'

/**
 * Semantic tokens only, no inline hex — see the "Tour availability
 * status badge" block in `app/globals.css`. AVAILABLE/CLOSED reuse
 * existing Blue Horizon/neutral tokens; LIMITED/CHECKING/SOLD_OUT have
 * their own dedicated pair so none of them borrow a color that already
 * means something else on the site (MICE gold, Ưu đãi red).
 */
const STATUS_STYLES: Record<TourAvailabilityStatus, { bg: string; text: string; dot: string }> = {
  AVAILABLE: { bg: 'bg-mv-mist-blue', text: 'text-mv-deep-navy', dot: 'bg-mv-journey-blue' },
  LIMITED: { bg: 'bg-mv-limited-bg', text: 'text-mv-limited-text', dot: 'bg-mv-limited-text' },
  CHECKING: { bg: 'bg-mv-checking-bg', text: 'text-mv-slate', dot: 'bg-mv-slate' },
  SOLD_OUT: { bg: 'bg-mv-soldout-bg', text: 'text-mv-soldout-text', dot: 'bg-mv-soldout-text' },
  CLOSED: { bg: 'bg-secondary', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
}

export function AvailabilityBadge({ availability }: { availability: DerivedAvailability }) {
  const style = STATUS_STYLES[availability.status]

  return (
    <span
      role="status"
      aria-label={`Trạng thái tour: ${availability.label}`}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none',
        style.bg,
        style.text,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} aria-hidden="true" />
      {availability.label}
    </span>
  )
}

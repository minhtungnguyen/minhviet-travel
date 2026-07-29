import { BadgeCheck, ShieldCheck, Ticket, Zap } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: Ticket, label: 'Vé điện tử tức thì' },
  { icon: Zap, label: 'Xác nhận nhanh' },
  { icon: BadgeCheck, label: 'Giá minh bạch' },
  { icon: ShieldCheck, label: 'Đặt vé an toàn' },
]

/**
 * Directly below the Hero (D10 requirement), no gap — a compact reassurance
 * bar, distinct from the fuller "Vì sao mua ở Minh Việt" icon block deeper
 * in the page (AttractionWhySection). Every claim here is already verified
 * true of the checkout flow (idempotency key, no stored card data, instant
 * e-ticket) — no claim added here that isn't already backed by the real
 * booking flow (docs/design/mv-ticket/01-design-direction.md §7).
 */
export function AttractionTrustStrip() {
  return (
    <div data-trust-strip className="border-b border-border bg-background py-3">
      <div className="container-mv flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-between">
        {TRUST_ITEMS.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
            <item.icon className="size-4 shrink-0 text-mv-journey-blue" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

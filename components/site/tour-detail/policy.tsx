import { CircleDollarSign, Undo2 } from 'lucide-react'
import type { CancellationTier } from '@/lib/tours/tour-detail-content'

export function TourPolicy({
  paymentPolicy,
  cancellationPolicy,
  cancellationNote,
}: {
  paymentPolicy: string[]
  cancellationPolicy: CancellationTier[]
  cancellationNote: string
}) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div>
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <CircleDollarSign className="size-5 text-primary" />
          Chính sách thanh toán
        </h3>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {paymentPolicy.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <Undo2 className="size-5 text-primary" />
          Chính sách hoàn / hủy
        </h3>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
          {cancellationPolicy.map((tier) => (
            <li key={tier.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span className="text-muted-foreground">{tier.label}</span>
              <span className="font-semibold text-foreground">{tier.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{cancellationNote}</p>
      </div>
    </div>
  )
}

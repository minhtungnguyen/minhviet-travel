import { QrCode, Landmark, CreditCard, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/flight'

const METHODS: { value: PaymentMethod; label: string; description: string; icon: typeof QrCode }[] = [
  { value: 'qr', label: 'Quét mã QR', description: 'Thanh toán qua ứng dụng ngân hàng/ví điện tử', icon: QrCode },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản trực tiếp tới tài khoản Minh Việt', icon: Landmark },
  { value: 'domestic_card', label: 'Thẻ nội địa', description: 'ATM/Napas — (Mock)', icon: CreditCard },
  { value: 'international_card', label: 'Thẻ quốc tế', description: 'Visa/Mastercard/JCB — (Mock)', icon: Globe },
]

/** Payment Method (EPIC-005 §4) — all four options are mock, no real gateway. */
export function FlightPaymentMethodList({
  selected,
  onSelect,
}: {
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {METHODS.map((method) => {
        const Icon = method.icon
        const active = method.value === selected
        return (
          <button
            key={method.value}
            type="button"
            onClick={() => onSelect(method.value)}
            aria-pressed={active}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
              active ? 'border-mv-journey-blue bg-mv-mist-blue/40' : 'border-border bg-card hover:border-mv-journey-blue/40',
            )}
          >
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-full',
                active ? 'bg-mv-journey-blue text-white' : 'bg-secondary text-mv-journey-blue',
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{method.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{method.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

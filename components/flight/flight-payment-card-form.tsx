import { Input } from '@/components/ui/input'

/**
 * Mock card entry form for "Thẻ nội địa"/"Thẻ quốc tế" (EPIC-005 §4).
 * Not wired to any gateway, no Luhn/real validation — purely decorative
 * so both card options have content to show when selected, matching
 * what QR/Bank Transfer show. Values are never read or sent anywhere.
 */
export function FlightPaymentCardForm({ variant }: { variant: 'domestic' | 'international' }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-4 text-xs text-muted-foreground">
        Nhập thông tin thẻ {variant === 'domestic' ? 'ATM nội địa (Napas)' : 'Visa/Mastercard/JCB'} — biểu mẫu minh hoạ (Mock), không kết nối cổng thanh toán thật.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-muted-foreground">Số thẻ</span>
          <Input className="mt-1.5" placeholder="•••• •••• •••• ••••" disabled />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Ngày hết hạn</span>
          <Input className="mt-1.5" placeholder="MM/YY" disabled />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">{variant === 'domestic' ? 'OTP' : 'CVV'}</span>
          <Input className="mt-1.5" placeholder="•••" disabled />
        </label>
      </div>
    </div>
  )
}

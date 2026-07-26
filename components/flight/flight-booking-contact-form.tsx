import { Input } from '@/components/ui/input'
import type { BookingContactInfo } from '@/types/flight'

/** Contact Information (EPIC-004 §4) — who to reach about this booking, distinct from each passenger's own details. */
export function FlightBookingContactForm({
  value,
  onChange,
  errors,
}: {
  value: BookingContactInfo
  onChange: (next: BookingContactInfo) => void
  errors?: Partial<Record<keyof BookingContactInfo, string>>
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-4 font-display text-base font-bold text-foreground">Thông tin liên hệ</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Họ và tên *</span>
          <Input
            className="mt-1.5"
            value={value.fullName}
            onChange={(event) => onChange({ ...value, fullName: event.target.value })}
            aria-invalid={Boolean(errors?.fullName)}
          />
          {errors?.fullName && <p className="mt-1 text-xs font-medium text-destructive">{errors.fullName}</p>}
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Email *</span>
          <Input
            type="email"
            className="mt-1.5"
            value={value.email}
            onChange={(event) => onChange({ ...value, email: event.target.value })}
            aria-invalid={Boolean(errors?.email)}
          />
          {errors?.email && <p className="mt-1 text-xs font-medium text-destructive">{errors.email}</p>}
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Số điện thoại *</span>
          <Input
            type="tel"
            className="mt-1.5"
            value={value.phone}
            onChange={(event) => onChange({ ...value, phone: event.target.value })}
            aria-invalid={Boolean(errors?.phone)}
          />
          {errors?.phone && <p className="mt-1 text-xs font-medium text-destructive">{errors.phone}</p>}
        </label>
      </div>
    </div>
  )
}

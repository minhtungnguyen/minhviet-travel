import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import type { BookingDocumentType, BookingGender, BookingPassenger } from '@/types/flight'

const GENDER_OPTIONS: { value: BookingGender; label: string }[] = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

const DOCUMENT_TYPE_OPTIONS: { value: BookingDocumentType; label: string }[] = [
  { value: 'cccd', label: 'CCCD/CMND' },
  { value: 'passport', label: 'Hộ chiếu' },
]

const TYPE_LABELS: Record<BookingPassenger['type'], string> = {
  adult: 'Người lớn',
  child: 'Trẻ em',
  infant: 'Em bé',
}

/** One passenger's details (EPIC-004 §4 Passenger Form). */
export function FlightBookingPassengerForm({
  passenger,
  label,
  onChange,
  errors,
}: {
  passenger: BookingPassenger
  label: string
  onChange: (next: BookingPassenger) => void
  errors?: Partial<Record<keyof BookingPassenger, string>>
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-foreground">
        {label}
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
          {TYPE_LABELS[passenger.type]}
        </span>
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold text-muted-foreground">Họ và tên *</span>
          <Input
            className="mt-1.5"
            value={passenger.fullName}
            onChange={(event) => onChange({ ...passenger, fullName: event.target.value })}
            aria-invalid={Boolean(errors?.fullName)}
          />
          {errors?.fullName && <p className="mt-1 text-xs font-medium text-destructive">{errors.fullName}</p>}
        </label>

        <div className="block">
          <span className="text-xs font-semibold text-muted-foreground">Giới tính *</span>
          <div className="mt-1.5">
            <Select value={passenger.gender} onValueChange={(next) => onChange({ ...passenger, gender: next as BookingGender })}>
              <SelectTrigger aria-label="Giới tính">
                <SelectValue placeholder="Chọn giới tính">
                  {(selected: BookingGender) => GENDER_OPTIONS.find((o) => o.value === selected)?.label ?? 'Chọn giới tính'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Ngày sinh *</span>
          <Input
            type="date"
            className="mt-1.5"
            value={passenger.dateOfBirth}
            onChange={(event) => onChange({ ...passenger, dateOfBirth: event.target.value })}
            aria-invalid={Boolean(errors?.dateOfBirth)}
          />
          {errors?.dateOfBirth && <p className="mt-1 text-xs font-medium text-destructive">{errors.dateOfBirth}</p>}
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Quốc tịch *</span>
          <Input
            className="mt-1.5"
            value={passenger.nationality}
            onChange={(event) => onChange({ ...passenger, nationality: event.target.value })}
            aria-invalid={Boolean(errors?.nationality)}
          />
          {errors?.nationality && <p className="mt-1 text-xs font-medium text-destructive">{errors.nationality}</p>}
        </label>

        <div className="block">
          <span className="text-xs font-semibold text-muted-foreground">Loại giấy tờ *</span>
          <div className="mt-1.5">
            <Select
              value={passenger.documentType}
              onValueChange={(next) => onChange({ ...passenger, documentType: next as BookingDocumentType })}
            >
              <SelectTrigger aria-label="Loại giấy tờ">
                <SelectValue placeholder="Chọn loại giấy tờ">
                  {(selected: BookingDocumentType) => DOCUMENT_TYPE_OPTIONS.find((o) => o.value === selected)?.label ?? 'Chọn loại giấy tờ'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Số giấy tờ *</span>
          <Input
            className="mt-1.5"
            value={passenger.documentNumber}
            onChange={(event) => onChange({ ...passenger, documentNumber: event.target.value })}
            aria-invalid={Boolean(errors?.documentNumber)}
          />
          {errors?.documentNumber && <p className="mt-1 text-xs font-medium text-destructive">{errors.documentNumber}</p>}
        </label>
      </div>
    </div>
  )
}

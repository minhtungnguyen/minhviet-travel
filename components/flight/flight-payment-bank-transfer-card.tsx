import { formatVnd } from '@/lib/flight/flight-format'

const ROWS = [
  { label: 'Ngân hàng', value: 'Vietcombank — CN Hải Phòng' },
  { label: 'Chủ tài khoản', value: 'CÔNG TY CP TM & DV DU LỊCH MINH VIỆT' },
  { label: 'Số tài khoản', value: '0011 0012 3456 789' },
]

/** Bank Transfer Card (EPIC-005 §4) — Mock account details. */
export function FlightPaymentBankTransferCard({ bookingId, amount }: { bookingId: string; amount: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <dl className="flex flex-col gap-3 text-sm">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
          <dt className="text-muted-foreground">Nội dung chuyển khoản</dt>
          <dd className="text-right font-mono font-semibold text-mv-journey-blue">{bookingId}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Số tiền</dt>
          <dd className="text-right font-display text-lg font-extrabold text-mv-journey-blue">{formatVnd(amount)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Vui lòng ghi đúng nội dung chuyển khoản để hệ thống đối soát tự động. Đây là thông tin minh hoạ (Mock), không phải tài khoản nhận tiền thật.
      </p>
    </div>
  )
}

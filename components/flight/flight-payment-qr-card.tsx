import { formatVnd } from '@/lib/flight/flight-format'

const GRID_SIZE = 8

/** Deterministic decorative pattern seeded by `bookingId` — not a real scannable QR code, just a stable visual per booking so it doesn't look like a broken/random placeholder on every render. Not a hook despite the shape — named to avoid the `use*` convention on purpose. */
function buildQrPattern(seed: string): boolean[] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    hash = (hash * 1103515245 + 12345) >>> 0
    return ((hash >> (i % 24)) & 1) === 1
  })
}

/** QR Code Card (EPIC-005 §4) — Mock only, clearly labeled illustrative. */
export function FlightPaymentQrCard({ bookingId, amount }: { bookingId: string; amount: number }) {
  const cells = buildQrPattern(bookingId)

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
      <div
        className="grid overflow-hidden rounded-lg border border-border"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: 176, height: 176 }}
        role="img"
        aria-label={`Mã QR minh hoạ cho đơn ${bookingId}`}
      >
        {cells.map((filled, index) => (
          <span key={index} className={filled ? 'bg-mv-deep-navy' : 'bg-white'} />
        ))}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Mã QR minh hoạ — không dùng để quét thanh toán thật</p>
        <p className="mt-1 font-display text-xl font-extrabold text-mv-journey-blue">{formatVnd(amount)}</p>
        <p className="text-xs text-muted-foreground">Nội dung chuyển khoản: {bookingId}</p>
      </div>
    </div>
  )
}

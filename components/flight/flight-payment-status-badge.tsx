import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/types/flight'

const STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: 'warning' | 'success' | 'destructive' | 'neutral' }> = {
  pending: { label: 'Đang chờ thanh toán', variant: 'warning' },
  success: { label: 'Thanh toán thành công', variant: 'success' },
  failed: { label: 'Thanh toán thất bại', variant: 'destructive' },
  expired: { label: 'Đã hết thời gian thanh toán', variant: 'neutral' },
}

/** Payment Status indicator (EPIC-005 §4). Per BRAND-003 §11, Gold is reserved for rating stars (+2 named exceptions, neither this) — never used for status badges. */
export function FlightPaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = STATUS_CONFIG[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

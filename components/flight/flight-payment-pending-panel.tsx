'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, RotateCw } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { FlightPaymentStatusBadge } from '@/components/flight/flight-payment-status-badge'

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/**
 * Pending Page content (EPIC-005 §4) — mock countdown (no real payment
 * gateway is polled). "Kiểm tra lại" resolves the mock payment as
 * successful immediately, standing in for what would be a real status
 * poll; a small secondary action lets the failure path be demoed
 * without waiting for the countdown to run out.
 */
export function FlightPaymentPendingPanel({
  expiresAt,
  onConfirm,
  onSimulateFailure,
  onExpire,
}: {
  expiresAt: string
  onConfirm: () => void
  onSimulateFailure: () => void
  onExpire: () => void
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000)))
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const next = Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setRemainingSeconds(next)
      if (next === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true
        onExpire()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
      <FlightPaymentStatusBadge status="pending" />
      <Loader2 className="size-8 animate-spin text-mv-journey-blue" aria-hidden />
      <div>
        <p className="font-display text-lg font-bold text-foreground">Đang chờ xác nhận thanh toán</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Hệ thống sẽ tự động cập nhật khi nhận được thanh toán. Thời gian giữ chỗ còn lại:
        </p>
        <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-mv-journey-blue">{formatCountdown(remainingSeconds)}</p>
      </div>
      <div className="mt-2 flex flex-col items-center gap-2">
        <MVButton type="button" variant="accent" size="lg" onClick={onConfirm}>
          <RotateCw className="size-4" />
          Kiểm tra lại
        </MVButton>
        <button type="button" onClick={onSimulateFailure} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          Mô phỏng thanh toán thất bại
        </button>
      </div>
    </div>
  )
}

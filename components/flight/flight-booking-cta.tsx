'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, CheckCircle2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { formatVnd } from '@/lib/flight/flight-format'

/**
 * Booking CTA (EPIC-003 §4.7 / §10: "CTA chuyển sang route Booking dự
 * kiến nhưng chưa thực hiện booking thật"). Booking/Payment (EPIC-004) is
 * out of scope and not built yet, so — same honesty pattern as
 * `FlightCard`'s "Chọn" in Search Results — "Tiếp tục đặt vé" doesn't
 * link to a dead route. It reveals a confirmation panel naming the
 * selected fare and a real hotline CTA to hold the seat today.
 */
export function FlightBookingCTA({
  fareName,
  totalForParty,
  backHref,
  sticky = false,
}: {
  fareName: string
  totalForParty: number
  backHref: string
  sticky?: boolean
}) {
  const [confirming, setConfirming] = useState(false)

  const content = (
    <div className="flex flex-col gap-3">
      {!confirming ? (
        <>
          <MVButton type="button" variant="accent" size="lg" className="w-full" onClick={() => setConfirming(true)}>
            Tiếp tục đặt vé
          </MVButton>
          {!sticky && (
            <MVButton href={backHref} variant="outline" size="md" className="w-full">
              <ArrowLeft className="size-4" />
              Quay lại kết quả
            </MVButton>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-2.5 rounded-xl bg-mv-mist-blue p-3.5 text-sm text-mv-deep-navy">
          <p className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mv-journey-blue" />
            Đã chọn {fareName} — {formatVnd(totalForParty)}. Đặt vé trực tuyến sẽ sớm ra mắt, gọi hotline để giữ chỗ ngay hôm nay:
          </p>
          <MVButton href="tel:0934368132" variant="accent" size="md" className="w-full">
            <Phone className="size-4" />
            0934 368 132
          </MVButton>
        </div>
      )}
    </div>
  )

  if (!sticky) return content

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur-lg sm:bottom-0 lg:hidden">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-1">
        {!confirming && (
          <Link href={backHref} aria-label="Quay lại kết quả" className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <div className="flex-1">{content}</div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Luggage, Phone, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MVButton } from '@/components/mv/mv-button'
import { formatClockTime, formatDuration, formatStopsLabel, formatVnd } from '@/lib/flight/flight-format'
import { cn } from '@/lib/utils'
import type { FlightOffer } from '@/types/flight'

const CABIN_LABELS: Record<string, string> = {
  economy: 'Phổ thông',
  premium_economy: 'Phổ thông đặc biệt',
  business: 'Thương gia',
  first: 'Hạng nhất',
}

/**
 * One bookable fare (EPIC-002 §3 Flight Card). "Chọn" doesn't link to a
 * Flight Detail/Booking page — those are EPIC-003/004, not built yet — it
 * expands an inline fare/baggage panel with a real hotline CTA instead of
 * a dead link, same honesty pattern as the homepage search box (see
 * `docs/Handover/Flight/EPIC-001-HANDOVER.md` Known Issues #3).
 */
export function FlightCard({ offer }: { offer: FlightOffer }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-soft-lg">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 sm:w-40">
          <span className="bg-gradient-mv-brand grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white">
            {offer.airlineCode}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{offer.airlineName}</p>
            <p className="text-xs text-muted-foreground">{offer.flightNumber}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="text-center">
            <p className="font-display text-lg font-bold text-foreground">{formatClockTime(offer.departTime)}</p>
            <p className="text-xs text-muted-foreground">{offer.originCode}</p>
          </div>

          <div className="flex flex-1 flex-col items-center px-2">
            <p className="text-xs text-muted-foreground">{formatDuration(offer.durationMinutes)}</p>
            <div className="my-1 h-px w-full bg-border" />
            <p className={cn('text-xs', offer.stops === 0 ? 'text-success' : 'text-muted-foreground')}>
              {formatStopsLabel(offer.stops)}
            </p>
          </div>

          <div className="text-center">
            <p className="font-display text-lg font-bold text-foreground">{formatClockTime(offer.arriveTime)}</p>
            <p className="text-xs text-muted-foreground">{offer.destinationCode}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:w-48 sm:flex-col sm:items-end">
          <div className="text-right">
            {offer.isRecommended && (
              <Badge variant="accent" className="mb-1">
                Khuyến nghị
              </Badge>
            )}
            <p className="font-display text-xl font-extrabold text-mv-journey-blue">{formatVnd(offer.price)}</p>
            <p className="text-[11px] text-muted-foreground">Tổng giá / {CABIN_LABELS[offer.cabinClass]}</p>
          </div>
          <MVButton
            type="button"
            variant={expanded ? 'secondary' : 'accent'}
            size="sm"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
          >
            {expanded ? 'Đóng' : 'Chọn'}
            <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
          </MVButton>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-secondary/40 px-5 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2 text-sm text-foreground">
              <Luggage className="mt-0.5 size-4 shrink-0 text-mv-journey-blue" />
              <div>
                <p className="font-semibold">Hành lý</p>
                <p className="text-muted-foreground">
                  Xách tay {offer.baggage.carryOnKg}kg · Ký gửi {offer.baggage.checkedKg}kg
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-0.5 size-4 shrink-0 text-center text-xs font-bold text-mv-journey-blue">%</span>
              <div>
                <p className="font-semibold">Điều kiện vé</p>
                <p className="text-muted-foreground">Đổi/hủy áp dụng theo chính sách hãng bay, tư vấn viên xác nhận trước khi thanh toán.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-card p-3.5 text-sm text-foreground">
            <span className="text-muted-foreground">
              Đặt vé trực tuyến cho chuyến bay này sẽ sớm ra mắt — gọi hotline để giữ chỗ ngay hôm nay:
            </span>
            <MVButton href="tel:0934368132" variant="outline" size="sm">
              <Phone className="size-4" />
              0934 368 132
            </MVButton>
          </div>
        </div>
      )}
    </article>
  )
}

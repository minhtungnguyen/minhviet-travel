'use client'

import { cn } from '@/lib/utils'
import type { FareCalendarDay } from '@/types/flight'

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/** ±3-day cheap-fare strip (EPIC-002 §3 Fare Calendar). Selecting a day re-navigates the Search Results page with a new `ngayDi`, so prices reflect a real (mock) search for that date rather than an inline estimate. */
export function FlightFareCalendar({
  days,
  onSelectDate,
}: {
  days: FareCalendarDay[]
  onSelectDate: (date: string) => void
}) {
  return (
    <div className="container-mv py-4">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">Giá tốt quanh ngày bạn chọn</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const date = new Date(day.date)
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              aria-current={day.isSelected ? 'date' : undefined}
              className={cn(
                'flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2.5 text-center transition-colors',
                day.isSelected
                  ? 'border-mv-journey-blue bg-mv-journey-blue text-white'
                  : 'border-border bg-card text-foreground hover:border-mv-journey-blue/50',
              )}
            >
              <span className="text-[11px] font-medium opacity-80">
                {WEEKDAY_LABELS[date.getUTCDay()]} {date.getUTCDate()}/{date.getUTCMonth() + 1}
              </span>
              <span className={cn('text-xs font-bold', day.isCheapest && !day.isSelected && 'text-success')}>
                {day.priceFrom.toLocaleString('vi-VN')}đ
              </span>
              {day.isCheapest && (
                <span className={cn('text-[10px] font-semibold uppercase tracking-wide', day.isSelected ? 'text-white/80' : 'text-success')}>
                  Rẻ nhất
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

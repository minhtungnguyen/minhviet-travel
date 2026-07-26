import { Briefcase, Luggage } from 'lucide-react'
import type { FlightBaggageAllowance } from '@/types/flight'

/** Baggage detail for the currently selected fare option (EPIC-003 §4.4). */
export function FlightBaggageInfo({ baggage }: { baggage: FlightBaggageAllowance }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-3 font-display text-base font-bold text-foreground">Hành lý</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Briefcase className="mt-0.5 size-5 shrink-0 text-mv-journey-blue" />
          <div>
            <p className="text-sm font-semibold text-foreground">Hành lý xách tay</p>
            <p className="text-sm text-muted-foreground">Tối đa {baggage.carryOnKg}kg / khách</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Luggage className="mt-0.5 size-5 shrink-0 text-mv-journey-blue" />
          <div>
            <p className="text-sm font-semibold text-foreground">Hành lý ký gửi</p>
            <p className="text-sm text-muted-foreground">
              {baggage.checkedKg > 0 ? `Tối đa ${baggage.checkedKg}kg / khách` : 'Không bao gồm — mua thêm khi làm thủ tục hoặc liên hệ tư vấn viên'}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        Phí mua thêm hành lý và giới hạn kích thước/trọng lượng cụ thể áp dụng theo quy định của từng hãng bay — tư vấn viên sẽ xác nhận chi tiết trước khi giữ chỗ.
      </p>
    </div>
  )
}

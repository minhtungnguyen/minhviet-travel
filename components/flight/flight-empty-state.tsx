import { SearchX, Phone } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/** Zero flights matched the current filters (not an error — EPIC-002 §2 explicitly requires a distinct Empty State). */
export function FlightEmptyState({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <SearchX className="size-10 text-muted-foreground" />
      <h3 className="font-display text-lg font-bold text-foreground">Không có chuyến bay phù hợp</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Không có chuyến bay nào khớp với bộ lọc hiện tại. Thử nới lỏng bộ lọc hoặc chọn ngày khác trong Fare Calendar phía trên.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <MVButton type="button" variant="outline" size="md" onClick={onResetFilters}>
          Xoá bộ lọc
        </MVButton>
        <MVButton href="tel:0934368132" variant="accent" size="md">
          <Phone className="size-4" />
          Gọi tư vấn viên
        </MVButton>
      </div>
    </div>
  )
}

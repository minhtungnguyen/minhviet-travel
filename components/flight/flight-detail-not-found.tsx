import { SearchX, Phone } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/**
 * "Flight not found" state (EPIC-003 §9) — a malformed or stale `flightId`
 * (e.g. an old bookmarked link after mock data regenerates). Server-
 * renderable on purpose (no `onRetry` callback): unlike `FlightErrorState`
 * (a real fetch failure worth retrying), there's nothing to retry here —
 * the id itself doesn't resolve, so the useful next step is going back to
 * search or calling the hotline, both plain links.
 */
export function FlightDetailNotFound({ backHref }: { backHref: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <SearchX className="size-10 text-muted-foreground" />
      <h3 className="font-display text-lg font-bold text-foreground">Không tìm thấy chuyến bay này</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Đường dẫn có thể đã cũ hoặc không còn hợp lệ. Vui lòng quay lại tìm kiếm hoặc gọi hotline để được hỗ trợ trực tiếp.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <MVButton href={backHref} variant="outline" size="md">
          Quay lại tìm kiếm
        </MVButton>
        <MVButton href="tel:0934368132" variant="accent" size="md">
          <Phone className="size-4" />
          0934 368 132
        </MVButton>
      </div>
    </div>
  )
}

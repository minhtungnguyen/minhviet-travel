import { ChevronDown } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/** "Load More" pagination (EPIC-002 §3) — all mock offers are already fetched in one request, so paging further only reveals more of the same in-memory list rather than issuing a new request. */
export function FlightPagination({
  total,
  visible,
  onLoadMore,
}: {
  total: number
  visible: number
  onLoadMore: () => void
}) {
  if (visible >= total) return null

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <MVButton type="button" variant="outline" size="md" onClick={onLoadMore}>
        Xem thêm chuyến bay
        <ChevronDown className="size-4" />
      </MVButton>
      <p className="text-xs text-muted-foreground">
        Đang hiển thị {visible}/{total} chuyến bay
      </p>
    </div>
  )
}

import { PackageSearch, Phone } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/** Defensive Empty State (EPIC-003 §9) for the case a flight has zero fare options — not reachable with the current mock generator (always produces 4 tiers), kept as the PRD-mandated fallback for when fare data comes from a real, sometimes-empty source. */
export function FlightDetailFareEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <PackageSearch className="size-10 text-muted-foreground" />
      <h3 className="font-display text-lg font-bold text-foreground">Chưa có gói giá cho chuyến bay này</h3>
      <p className="max-w-sm text-sm text-muted-foreground">Gói giá đang được cập nhật. Vui lòng gọi hotline để được tư vấn viên báo giá trực tiếp.</p>
      <MVButton href="tel:0934368132" variant="accent" size="md">
        <Phone className="size-4" />
        0934 368 132
      </MVButton>
    </div>
  )
}

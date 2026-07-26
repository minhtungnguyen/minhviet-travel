import { Phone, MessageCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/** Hotline/support contact box (EPIC-003 §4.7) — always present alongside the CTA, reflecting the Brand DNA rule that every important flow keeps a real-human exit. */
export function FlightSupportBox() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/40 p-4 text-sm">
      <MessageCircle className="size-5 shrink-0 text-mv-journey-blue" />
      <p className="flex-1 text-muted-foreground">Cần tư vấn thêm về chuyến bay này? Đội ngũ Minh Việt sẵn sàng hỗ trợ.</p>
      <MVButton href="tel:0934368132" variant="outline" size="sm">
        <Phone className="size-3.5" />
        Gọi ngay
      </MVButton>
    </div>
  )
}

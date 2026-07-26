'use client'

import { AlertTriangle, Phone, RotateCcw } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/**
 * Search Results failed to load (EPIC-002 §2 / `TECH-007-Error-Handling.md`
 * §6: every screen needs an Error Banner + Retry + Contact Support). No
 * stack trace or technical detail is shown to the user.
 */
export function FlightErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <h3 className="font-display text-lg font-bold text-foreground">Không thể tải kết quả tìm kiếm</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Đã có lỗi xảy ra khi tải danh sách chuyến bay. Vui lòng thử lại hoặc liên hệ hotline để được hỗ trợ đặt vé trực tiếp.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <MVButton type="button" variant="accent" size="lg" onClick={onRetry}>
          <RotateCcw className="size-4" />
          Thử lại
        </MVButton>
        <MVButton href="tel:0934368132" variant="outline" size="lg">
          <Phone className="size-4" />
          0934 368 132
        </MVButton>
      </div>
    </div>
  )
}

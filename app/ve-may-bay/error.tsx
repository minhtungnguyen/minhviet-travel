'use client'

import { useEffect } from 'react'
import { Phone, RotateCcw } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { ErrorPageChrome } from '@/components/site/error-page-chrome'

export default function FlightHomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorPageChrome>
      <div className="container-mv flex flex-col items-center gap-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Không thể tải trang Vé máy bay</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Đã có lỗi xảy ra khi tải nội dung. Vui lòng thử lại hoặc liên hệ hotline để được hỗ trợ đặt vé trực tiếp.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <MVButton type="button" onClick={reset} variant="accent" size="lg">
            <RotateCcw className="size-4" />
            Thử lại
          </MVButton>
          <MVButton href="tel:0934368132" variant="outline" size="lg">
            <Phone className="size-4" />
            0934 368 132
          </MVButton>
        </div>
      </div>
    </ErrorPageChrome>
  )
}

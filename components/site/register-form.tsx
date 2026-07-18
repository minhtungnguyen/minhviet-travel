'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

export function RegisterForm() {
  const [notice, setNotice] = useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setNotice(true)
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Họ và tên</span>
          <input
            required
            type="text"
            className="mt-1.5 h-13 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Đơn vị / Doanh nghiệp</span>
          <input
            type="text"
            className="mt-1.5 h-13 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Email</span>
        <input
          required
          type="email"
          className="mt-1.5 h-13 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Mật khẩu</span>
        <input
          required
          type="password"
          className="mt-1.5 h-13 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      {notice && (
        <p className="flex items-start gap-2 rounded-lg bg-secondary px-3.5 py-3 text-xs leading-relaxed text-secondary-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          Cổng khách hàng đang được phát triển. Vui lòng liên hệ chuyên viên tư vấn để được hỗ trợ trực tiếp.
        </p>
      )}

      <MVButton type="submit" variant="gold" size="lg" className="w-full">
        Tạo tài khoản
      </MVButton>
    </form>
  )
}

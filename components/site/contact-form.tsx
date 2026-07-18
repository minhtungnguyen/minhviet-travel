'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

const services = ['Tour đoàn', 'MICE & Sự kiện', 'Khách sạn', 'Du thuyền', 'Vé máy bay', 'Visa', 'Khác']

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-card p-12 text-center shadow-soft-lg">
        <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-5 font-display text-xl font-bold text-foreground">Đã ghi nhận yêu cầu</h3>
        <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          Cảm ơn bạn đã liên hệ. Chuyên viên tư vấn Minh Việt sẽ phản hồi trong thời gian sớm nhất.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
      className="rounded-3xl bg-card p-7 shadow-soft-lg sm:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Họ và tên *</span>
          <input
            required
            type="text"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Đơn vị / Doanh nghiệp</span>
          <input
            type="text"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Email *</span>
          <input
            required
            type="email"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Số điện thoại *</span>
          <input
            required
            type="tel"
            className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-semibold text-muted-foreground">Nhu cầu quan tâm</span>
        <select className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary">
          {services.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="mt-5 block">
        <span className="text-xs font-semibold text-muted-foreground">Nội dung yêu cầu</span>
        <textarea
          rows={4}
          className="mt-1.5 w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <MVButton type="submit" variant="primary" size="lg" className="mt-6 w-full sm:w-auto">
        Gửi yêu cầu tư vấn
      </MVButton>
    </form>
  )
}

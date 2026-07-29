'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { MVButton } from '@/components/mv/mv-button'

/** Shown when the booking-result page is opened without (or with an incorrect) `?email=` — lets the customer re-enter the email used at checkout instead of hitting a dead end. */
export function AttractionOrderLookupForm({ orderCode }: { orderCode: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    router.push(`/ve-vui-choi/ket-qua/${orderCode}?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
      <label className="text-left">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Email dùng khi đặt vé</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-mv-journey-blue"
        />
      </label>
      <MVButton type="submit" variant="accent" size="md">
        Tra cứu đơn hàng
      </MVButton>
    </form>
  )
}

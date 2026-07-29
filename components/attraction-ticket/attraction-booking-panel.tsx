'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Loader2, Minus, Plus, ShieldAlert, Ticket } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { formatVnd } from '@/lib/flight/flight-format'
import type { AttractionVariantOption } from '@/lib/attraction-ticket/build-variant-options'

const TOMORROW = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})()

type AvailabilityState = { price: number; remaining: number | null; loading: boolean; error: string | null }

/** Maps `AppError.code` to a friendly Vietnamese message — never shown a raw error code/stack to the customer (brief §I.13). */
function friendlyError(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'CONFLICT':
      return 'Không đủ vé khả dụng cho lựa chọn này. Vui lòng chọn ngày khác hoặc giảm số lượng.'
    case 'VALIDATION_ERROR':
      return 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.'
    case 'NOT_FOUND':
      return 'Vé này hiện không khả dụng.'
    case 'RATE_LIMITED':
      return 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.'
    default:
      return fallback
  }
}

export function AttractionBookingPanel({
  productId,
  websiteId,
  variantOptions,
}: {
  productId: string
  websiteId: string
  variantOptions: AttractionVariantOption[]
}) {
  const router = useRouter()
  const idempotencyKeyRef = useRef(crypto.randomUUID())

  const [selectedVariantId, setSelectedVariantId] = useState(variantOptions[0]?.providerVariantId ?? '')
  const [date, setDate] = useState(TOMORROW)
  const [quantity, setQuantity] = useState(1)
  const [availability, setAvailability] = useState<AvailabilityState>(() => {
    const initial = variantOptions[0]
    return { price: initial?.price ?? 0, remaining: initial?.remaining ?? null, loading: false, error: null }
  })

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [note, setNote] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * Triggered directly from the date input / variant radio `onChange`
   * handlers below, never from a `useEffect` — calling `setAvailability`
   * synchronously at the top of an effect body is flagged by the
   * `react-hooks/set-state-in-effect` rule (cascading-render risk); doing
   * it from a genuine user event handler instead sidesteps that entirely
   * and is the more idiomatic fix, not a workaround.
   */
  const requestTokenRef = useRef(0)
  const refreshAvailability = useCallback((variantId: string, selectedDate: string) => {
    if (!variantId || !selectedDate) return
    const token = ++requestTokenRef.current
    setAvailability((prev) => ({ ...prev, loading: true, error: null }))
    fetch('/api/v1/attraction-tickets/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerVariantId: variantId, date: selectedDate }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (requestTokenRef.current !== token) return
        if (!body.success) {
          setAvailability((prev) => ({ ...prev, loading: false, error: friendlyError(body.error?.code, 'Không kiểm tra được vé, vui lòng thử lại.') }))
          return
        }
        setAvailability({ price: body.data.price, remaining: body.data.remaining, loading: false, error: null })
      })
      .catch(() => {
        if (requestTokenRef.current === token) {
          setAvailability((prev) => ({ ...prev, loading: false, error: 'Không kiểm tra được vé, vui lòng thử lại.' }))
        }
      })
  }, [])

  const totalAmount = availability.price * quantity
  const isSoldOut = availability.remaining !== null && availability.remaining < quantity
  const canSubmit =
    !submitting &&
    !availability.loading &&
    !isSoldOut &&
    !availability.error &&
    selectedVariantId &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length >= 6 &&
    /\S+@\S+\.\S+/.test(customerEmail) &&
    agreedToTerms

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/v1/attraction-tickets/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          idempotencyKey: idempotencyKeyRef.current,
          items: [{ attractionProductId: productId, providerVariantId: selectedVariantId, usageDate: date, quantity }],
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          note: note.trim() || undefined,
        }),
      })
      const body = await res.json()
      if (!body.success) {
        setSubmitError(friendlyError(body.error?.code, 'Đặt vé không thành công. Vui lòng thử lại.'))
        setSubmitting(false)
        return
      }
      router.push(`/ve-vui-choi/ket-qua/${body.data.order.orderCode}?email=${encodeURIComponent(customerEmail.trim())}`)
    } catch {
      setSubmitError('Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.')
      setSubmitting(false)
    }
  }

  if (variantOptions.length === 0) {
    return (
      <div id="booking-panel" className="rounded-2xl border border-border bg-card p-6 text-center">
        <ShieldAlert className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Vé này chưa có loại vé khả dụng. Vui lòng liên hệ để được tư vấn.</p>
        <MVButton href="/contact" variant="outline" size="md" className="mt-4 w-full">
          Liên hệ tư vấn
        </MVButton>
      </div>
    )
  }

  return (
    <div id="booking-panel" className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <p className="font-display text-lg font-bold text-mv-deep-navy">Chọn ngày &amp; loại vé</p>

      <label className="mt-4 block">
        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <CalendarDays className="size-3.5" /> Ngày sử dụng
        </span>
        <input
          type="date"
          value={date}
          min={TOMORROW}
          onChange={(e) => {
            setDate(e.target.value)
            refreshAvailability(selectedVariantId, e.target.value)
          }}
          className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-mv-journey-blue focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </label>

      <div className="mt-4 space-y-2">
        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Ticket className="size-3.5" /> Loại vé
        </span>
        {variantOptions.length === 1 ? (
          // Single ticket type — nothing to choose between, radio-card would just be visual noise (14-implementation-plan.md Bước 7 item 1).
          <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-mv-journey-blue bg-mv-mist-blue/40 p-3">
            <span className="text-sm font-medium text-foreground">{variantOptions[0].label}</span>
            <span className="text-sm font-semibold text-mv-deep-navy">{formatVnd(variantOptions[0].price)}</span>
          </div>
        ) : (
          variantOptions.map((option) => (
            <label
              key={option.providerVariantId}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-3 transition-colors ${
                selectedVariantId === option.providerVariantId ? 'border-mv-journey-blue bg-mv-mist-blue/40' : 'border-border bg-background'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="variant"
                  value={option.providerVariantId}
                  checked={selectedVariantId === option.providerVariantId}
                  onChange={() => {
                    setSelectedVariantId(option.providerVariantId)
                    refreshAvailability(option.providerVariantId, date)
                  }}
                  className="size-4 accent-[--mv-journey-blue]"
                />
                <span className="text-sm font-medium text-foreground">{option.label}</span>
              </span>
              <span className="text-sm font-semibold text-mv-deep-navy">{formatVnd(option.price)}</span>
            </label>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Số lượng</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
            className="grid size-9 place-items-center rounded-full border border-border text-foreground disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            disabled={quantity >= 10}
            aria-label="Tăng số lượng"
            className="grid size-9 place-items-center rounded-full border border-border text-foreground disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {availability.error && <p className="mt-3 text-xs text-destructive">{availability.error}</p>}
      {!availability.error && isSoldOut && (
        <p className="mt-3 text-xs text-destructive">Chỉ còn {availability.remaining} vé cho ngày này — vui lòng giảm số lượng hoặc chọn ngày khác.</p>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-foreground">Tổng cộng</span>
          <span className="font-display text-2xl font-extrabold text-mv-journey-blue">
            {availability.loading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : formatVnd(totalAmount)}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-5">
        <p className="text-sm font-semibold text-foreground">Thông tin liên hệ</p>
        <div>
          <label htmlFor="customerName" className="mb-1 block text-xs font-medium text-muted-foreground">
            Họ và tên *
          </label>
          <input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-mv-journey-blue"
          />
        </div>
        <div>
          <label htmlFor="customerPhone" className="mb-1 block text-xs font-medium text-muted-foreground">
            Số điện thoại *
          </label>
          <input
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-mv-journey-blue"
          />
        </div>
        <div>
          <label htmlFor="customerEmail" className="mb-1 block text-xs font-medium text-muted-foreground">
            Email *
          </label>
          <input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-mv-journey-blue"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Vé điện tử và mã đơn hàng sẽ gửi về email này.</p>
        </div>
        <div>
          <label htmlFor="note" className="mb-1 block text-xs font-medium text-muted-foreground">
            Ghi chú (không bắt buộc)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus-visible:border-mv-journey-blue"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-0.5 size-4 accent-[--mv-journey-blue]" />
          Tôi đồng ý với chính sách vé và điều khoản đặt chỗ của Minh Việt Travel.
        </label>
      </div>

      {submitError && <p className="mt-3 text-sm text-destructive">{submitError}</p>}

      <MVButton type="button" variant="accent" size="lg" className="mt-5 w-full" disabled={!canSubmit} onClick={handleSubmit}>
        {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Đặt vé'}
      </MVButton>
    </div>
  )
}

/** Mobile-only sticky bar — same `bottom-16/sm:bottom-0/lg:hidden` positioning as `components/flight/flight-booking-cta.tsx`, scrolls to the full panel instead of navigating (this is a single-page flow, not a separate booking route). */
export function AttractionBookingMobileBar({ priceFrom }: { priceFrom: number | null }) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur-lg sm:bottom-0 lg:hidden">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] text-muted-foreground">Giá từ</p>
          <p className="font-display text-lg font-bold text-mv-deep-navy">{priceFrom !== null ? formatVnd(priceFrom) : 'Liên hệ'}</p>
        </div>
        <a
          href="#booking-panel"
          className="inline-flex h-11 items-center justify-center rounded-sm bg-accent px-6 text-sm font-semibold text-white"
        >
          Đặt vé
        </a>
      </div>
    </div>
  )
}

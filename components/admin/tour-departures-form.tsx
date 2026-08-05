'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Trash2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { createTourDepartureAction, deleteTourDepartureAction, updateTourDepartureAction } from '@/app/admin/tours/departures-actions'
import type { TourDeparture, TourDepartureStatus, TourPriceType } from '@/modules/tour-departures/domain/types'

const STATUS_LABEL: Record<TourDepartureStatus, string> = {
  OPEN: 'Còn chỗ',
  LIMITED: 'Sắp hết chỗ',
  ALMOST_FULL: 'Gần đầy',
  CLOSED: 'Hết chỗ',
  PENDING_CONFIRMATION: 'Chờ xác nhận',
}
const PRICE_TYPE_LABEL: Record<TourPriceType, string> = { ESTIMATE: 'Giá tạm tính', CONFIRMED: 'Giá đã chốt' }

const inputClass = 'h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-primary'

function DepartureRow({
  departure,
  pageId,
  websiteId,
}: {
  departure: TourDeparture
  pageId: string
  websiteId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function patch(update: Partial<{ status: TourDepartureStatus; priceType: TourPriceType }>) {
    setError(null)
    startTransition(async () => {
      const result = await updateTourDepartureAction(departure.id, pageId, update, websiteId)
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  function handleDelete() {
    if (!window.confirm(`Xoá ngày khởi hành ${departure.departureDate}?`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteTourDepartureAction(departure.id, pageId, websiteId)
      if (!result.ok) setError(result.message)
      else router.refresh()
    })
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2 text-sm text-foreground">{departure.departureDate}</td>
      <td className="px-3 py-2 text-sm text-muted-foreground">{departure.returnDate ?? '—'}</td>
      <td className="px-3 py-2 text-sm text-foreground">{departure.price.toLocaleString('vi-VN')}₫</td>
      <td className="px-3 py-2">
        <select
          className={inputClass}
          value={departure.priceType}
          disabled={isPending}
          onChange={(e) => patch({ priceType: e.target.value as TourPriceType })}
        >
          {Object.entries(PRICE_TYPE_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-sm text-muted-foreground">
        {departure.seatsAvailable ?? '—'}
        {departure.seatsTotal ? ` / ${departure.seatsTotal}` : ''}
      </td>
      <td className="px-3 py-2">
        <select
          className={inputClass}
          value={departure.status}
          disabled={isPending}
          onChange={(e) => patch({ status: e.target.value as TourDepartureStatus })}
        >
          {Object.entries(STATUS_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-right">
        <button type="button" disabled={isPending} onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Xoá">
          <Trash2 className="size-4" />
        </button>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </td>
    </tr>
  )
}

export function TourDeparturesForm({ pageId, websiteId, departures }: { pageId: string; websiteId: string; departures: TourDeparture[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [price, setPrice] = useState('')
  const [seatsTotal, setSeatsTotal] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createTourDepartureAction(
        {
          pageId,
          departureDate,
          returnDate: returnDate || undefined,
          price: Number(price),
          priceType: 'ESTIMATE',
          seatsTotal: seatsTotal ? Number(seatsTotal) : undefined,
          seatsAvailable: seatsTotal ? Number(seatsTotal) : undefined,
          status: 'OPEN',
        },
        websiteId,
      )
      if (!result.ok) {
        setError(result.message)
        return
      }
      setDepartureDate('')
      setReturnDate('')
      setPrice('')
      setSeatsTotal('')
      router.refresh()
    })
  }

  return (
    <div>
      <h2 className="mb-2 font-display text-base font-semibold text-foreground">Ngày khởi hành &amp; giá</h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        {error && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}

        {departures.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Khởi hành</th>
                  <th className="px-3 py-2">Kết thúc</th>
                  <th className="px-3 py-2">Giá</th>
                  <th className="px-3 py-2">Loại giá</th>
                  <th className="px-3 py-2">Chỗ còn/tổng</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {departures.map((d) => (
                  <DepartureRow key={d.id} departure={d} pageId={pageId} websiteId={websiteId} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {departures.length === 0 && (
          <p className="rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            Chưa có ngày khởi hành nào — bắt buộc phải có ít nhất 1 ngày trước khi xuất bản.
          </p>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Ngày khởi hành</span>
            <input type="date" className={inputClass} value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Ngày kết thúc</span>
            <input type="date" className={inputClass} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Giá (VNĐ)</span>
            <input type="number" min="0" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Số chỗ (không bắt buộc)</span>
            <input type="number" min="0" className={inputClass} value={seatsTotal} onChange={(e) => setSeatsTotal(e.target.value)} />
          </label>
          <div className="col-span-full">
            <MVButton type="submit" size="sm" loading={isPending}>
              Thêm ngày khởi hành
            </MVButton>
          </div>
        </form>
      </div>
    </div>
  )
}

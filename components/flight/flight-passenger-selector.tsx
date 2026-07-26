'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FlightPassengerCounts = { adults: number; children: number; infants: number }

const rows: { key: keyof FlightPassengerCounts; label: string; hint: string; min: number; max: number }[] = [
  { key: 'adults', label: 'Người lớn', hint: 'Từ 12 tuổi', min: 1, max: 9 },
  { key: 'children', label: 'Trẻ em', hint: '2 – 11 tuổi', min: 0, max: 8 },
  { key: 'infants', label: 'Em bé', hint: 'Dưới 2 tuổi', min: 0, max: 8 },
]

export function FlightPassengerSelector({
  value,
  onChange,
  className,
}: {
  value: FlightPassengerCounts
  onChange: (value: FlightPassengerCounts) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const total = value.adults + value.children + value.infants

  function step(key: keyof FlightPassengerCounts, direction: 1 | -1) {
    const row = rows.find((r) => r.key === key)
    if (!row) return
    const next = Math.min(row.max, Math.max(row.min, value[key] + direction))
    const updated = { ...value, [key]: next }
    if (updated.infants > updated.adults) updated.infants = updated.adults
    onChange(updated)
  }

  return (
    <div className={cn('relative min-w-0', className)} ref={containerRef}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Hành khách</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-background px-3.5 text-left text-sm text-foreground outline-none transition-colors hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <Users className="size-4 shrink-0 text-mv-journey-blue" />
        <span className="truncate">{total} khách</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chọn số hành khách"
          className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-soft-lg"
        >
          <div className="flex flex-col gap-4">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.hint}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => step(row.key, -1)}
                    disabled={value[row.key] <= row.min}
                    aria-label={`Giảm ${row.label}`}
                    className="grid size-8 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-mv-journey-blue hover:text-mv-journey-blue disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold text-foreground">{value[row.key]}</span>
                  <button
                    type="button"
                    onClick={() => step(row.key, 1)}
                    disabled={value[row.key] >= row.max}
                    aria-label={`Tăng ${row.label}`}
                    className="grid size-8 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-mv-journey-blue hover:text-mv-journey-blue disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-lg bg-secondary py-2 text-sm font-semibold text-mv-journey-blue transition-colors hover:bg-secondary/70"
          >
            Xong
          </button>
        </div>
      )}
    </div>
  )
}

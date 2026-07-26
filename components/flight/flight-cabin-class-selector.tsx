import { Armchair } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FlightCabinClass, FlightCabinClassOption } from '@/types/flight'

export function FlightCabinClassSelector({
  value,
  onChange,
  options,
  className,
}: {
  value: FlightCabinClass
  onChange: (value: FlightCabinClass) => void
  options: FlightCabinClassOption[]
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Hạng ghế</span>
      <Select value={value} onValueChange={(next) => onChange(next as FlightCabinClass)}>
        <SelectTrigger aria-label="Hạng ghế">
          <span className="flex min-w-0 items-center gap-2">
            <Armchair className="size-4 shrink-0 text-mv-journey-blue" />
            <span className="truncate">
              <SelectValue placeholder="Chọn hạng ghế">
                {(selected: FlightCabinClass) => options.find((option) => option.value === selected)?.label ?? 'Chọn hạng ghế'}
              </SelectValue>
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

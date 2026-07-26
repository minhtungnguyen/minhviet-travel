import type { ComponentType } from 'react'
import { MapPin } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FlightAirport } from '@/types/flight'

export function FlightAirportSelector({
  label,
  value,
  onChange,
  airports,
  icon: Icon = MapPin,
  className,
}: {
  label: string
  value: string
  onChange: (code: string) => void
  airports: FlightAirport[]
  icon?: ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(next) => onChange(next as string)}>
        <SelectTrigger aria-label={label}>
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="size-4 shrink-0 text-mv-journey-blue" />
            <span className="truncate">
              <SelectValue placeholder="Chọn sân bay">
                {(selected: string) => {
                  const airport = airports.find((a) => a.code === selected)
                  return airport ? `${airport.city} (${airport.code})` : 'Chọn sân bay'
                }}
              </SelectValue>
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          {airports.map((airport) => (
            <SelectItem key={airport.code} value={airport.code}>
              <span className="flex flex-col">
                <span className="font-medium text-foreground">
                  {airport.city} ({airport.code})
                </span>
                <span className="text-xs text-muted-foreground">{airport.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

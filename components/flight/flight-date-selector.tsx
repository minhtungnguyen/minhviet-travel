import { CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FlightDateSelector({
  label,
  value,
  onChange,
  min,
  disabled,
  error,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  disabled?: boolean
  error?: string
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <CalendarDays className="size-3.5 text-mv-journey-blue" />
        {label}
      </span>
      <Input
        type="date"
        value={value}
        min={min}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        aria-invalid={Boolean(error)}
        className={disabled ? 'text-muted-foreground' : undefined}
      />
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

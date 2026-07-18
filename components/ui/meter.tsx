import { Meter as MeterPrimitive } from '@base-ui/react/meter'

import { cn } from '@/lib/utils'

/**
 * Renders a categorical confidence band (high/medium/low) as a visual
 * meter bar — never a fabricated precision percentage. The `value` is
 * only ever 33/66/100 internally to drive the fill width; the visible
 * text label always comes from the caller (e.g. "Phù hợp cao").
 */
function Meter({
  value,
  valueText,
  className,
  ...props
}: {
  value: number
  valueText: string
  className?: string
} & Omit<React.ComponentProps<typeof MeterPrimitive.Root>, 'value' | 'aria-valuetext'>) {
  return (
    <MeterPrimitive.Root
      data-slot="meter"
      value={value}
      aria-valuetext={valueText}
      className={cn('flex flex-col gap-1', className)}
      {...props}
    >
      <MeterPrimitive.Track className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <MeterPrimitive.Indicator className="h-full rounded-full bg-gold transition-[width] duration-[220ms] ease-out" />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  )
}

export { Meter }

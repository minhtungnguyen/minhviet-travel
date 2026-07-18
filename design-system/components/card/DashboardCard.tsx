import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardBaseClass } from './_shared'

export type DashboardCardProps = {
  label: string
  value: string
  icon?: LucideIcon
  /** Positive shows an up-trend in success color, negative shows down-trend in danger color. */
  trend?: { value: string; direction: 'up' | 'down' }
  className?: string
}

/** KPI/metric card for admin and product dashboards. */
export function DashboardCard({ label, value, icon: Icon, trend, className }: DashboardCardProps) {
  return (
    <div className={cn(cardBaseClass, 'p-5 hover:border-ds-border-subtle hover:shadow-ds-soft', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ds-text-secondary">{label}</p>
        {Icon && (
          <span className="grid size-8 place-items-center rounded-ds-md bg-ds-surface-muted text-ds-text-muted">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-ds-heading text-2xl font-bold text-ds-text-primary">{value}</p>
      {trend && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1 text-xs font-semibold',
            trend.direction === 'up' ? 'text-ds-success-default' : 'text-ds-danger-default',
          )}
        >
          {trend.direction === 'up' ? (
            <ArrowUpRight className="size-3.5" />
          ) : (
            <ArrowDownRight className="size-3.5" />
          )}
          {trend.value}
        </p>
      )}
    </div>
  )
}

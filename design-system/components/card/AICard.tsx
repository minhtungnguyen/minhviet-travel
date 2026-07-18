import type { LucideIcon } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardBaseClass } from './_shared'

export type AICardProps = {
  title: string
  description?: string
  /** 0–100 confidence/match score. Renders as a labelled progress bar. */
  score?: number
  scoreLabel?: string
  icon?: LucideIcon
  badge?: string
  className?: string
}

/** Presents a single AI-generated insight or recommendation with its confidence score. */
export function AICard({
  title,
  description,
  score,
  scoreLabel = 'Độ phù hợp',
  icon: Icon = Sparkles,
  badge,
  className,
}: AICardProps) {
  return (
    <div className={cn(cardBaseClass, 'p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-ds-lg bg-ds-interactive-subtle text-ds-interactive-default">
          <Icon className="size-5" />
        </span>
        {badge && (
          <span className="rounded-ds-full bg-ds-accent-subtle px-2.5 py-1 text-[11px] font-semibold text-ds-accent-text">
            {badge}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-ds-heading text-base font-semibold text-ds-text-primary">{title}</h3>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-ds-text-secondary">{description}</p>}

      {typeof score === 'number' && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ds-text-muted">{scoreLabel}</span>
            <span className="font-semibold text-ds-interactive-default">{Math.round(score)}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-ds-full bg-ds-surface-muted">
            <div
              className="ds-transition h-full rounded-ds-full bg-ds-interactive-default"
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

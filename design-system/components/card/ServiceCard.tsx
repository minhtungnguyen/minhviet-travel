import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardBaseClass } from './_shared'

export type ServiceCardProps = {
  href: string
  icon: LucideIcon
  title: string
  description?: string
  className?: string
  /** Compact renders icon + label only (dense grids); default includes description. */
  compact?: boolean
}

export function ServiceCard({ href, icon: Icon, title, description, className, compact }: ServiceCardProps) {
  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          cardBaseClass,
          'items-center gap-3 p-5 text-center hover:-translate-y-0 hover:border-ds-interactive-border',
          className,
        )}
      >
        <span className="grid size-11 place-items-center rounded-ds-lg bg-ds-surface-muted text-ds-text-primary group-hover:bg-ds-interactive-subtle group-hover:text-ds-interactive-default">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <span className="text-sm font-semibold text-ds-text-primary">{title}</span>
      </Link>
    )
  }

  return (
    <Link href={href} className={cn(cardBaseClass, 'p-6', className)}>
      <span className="grid size-12 place-items-center rounded-ds-lg bg-ds-surface-muted text-ds-text-primary group-hover:bg-ds-interactive-subtle group-hover:text-ds-interactive-default">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 font-ds-heading text-base font-semibold text-ds-text-primary">{title}</h3>
      {description && <p className="mt-1.5 text-sm leading-relaxed text-ds-text-secondary">{description}</p>}
    </Link>
  )
}

import { cn } from '@/lib/utils'

export type SidebarProps = {
  header?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  width?: string
}

/** Fixed-width, full-height navigation rail for dashboard/admin layouts. */
export function Sidebar({ header, children, footer, className, width = '272px' }: SidebarProps) {
  return (
    <aside
      style={{ width }}
      className={cn(
        'flex h-screen shrink-0 flex-col border-r border-ds-border-subtle bg-ds-surface-base',
        className,
      )}
    >
      {header && <div className="border-b border-ds-border-subtle px-5 py-5">{header}</div>}
      <nav className="flex-1 overflow-y-auto px-3 py-4">{children}</nav>
      {footer && <div className="border-t border-ds-border-subtle px-5 py-4">{footer}</div>}
    </aside>
  )
}

export type SidebarItemProps = {
  icon?: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  href?: string
}

/** Single navigation row inside a Sidebar. */
export function SidebarItem({ icon, label, active, onClick, href }: SidebarItemProps) {
  const classes = cn(
    'ds-transition flex w-full items-center gap-3 rounded-ds-md px-3 py-2.5 text-sm font-medium',
    active
      ? 'bg-ds-interactive-subtle text-ds-interactive-default'
      : 'text-ds-text-secondary hover:bg-ds-surface-muted hover:text-ds-text-primary',
  )

  if (href) {
    return (
      <a href={href} className={classes}>
        {icon}
        {label}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {icon}
      {label}
    </button>
  )
}

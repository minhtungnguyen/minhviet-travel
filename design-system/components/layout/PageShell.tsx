import { cn } from '@/lib/utils'

export type PageShellProps = {
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Reserve space for a fixed/sticky header so content never renders underneath it. */
  headerOffset?: string
}

/** Top-level page scaffold: sticky header slot + main content + footer slot. */
export function PageShell({ header, footer, children, className, headerOffset }: PageShellProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-ds-surface-base', className)}>
      {header}
      <main className="flex-1" style={headerOffset ? { paddingTop: headerOffset } : undefined}>
        {children}
      </main>
      {footer}
    </div>
  )
}

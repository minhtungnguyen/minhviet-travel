import { cn } from '@/lib/utils'
import { zIndex } from '@/design-system/tokens/z-index'
import { Container } from './Container'

export type HeaderProps = {
  logo: React.ReactNode
  nav?: React.ReactNode
  actions?: React.ReactNode
  sticky?: boolean
  className?: string
}

/** Generic application header shell: logo / nav / actions, three-slot row. */
export function Header({ logo, nav, actions, sticky = true, className }: HeaderProps) {
  return (
    <header
      style={{ zIndex: zIndex.sticky }}
      className={cn(
        'border-b border-ds-border-subtle bg-ds-surface-base/95 backdrop-blur',
        sticky && 'sticky top-0',
        className,
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-6 lg:h-[72px]">
          <div className="shrink-0">{logo}</div>
          {nav && <nav className="hidden flex-1 items-center justify-center lg:flex">{nav}</nav>}
          {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
        </div>
      </Container>
    </header>
  )
}

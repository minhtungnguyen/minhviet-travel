import { cn } from '@/lib/utils'
import { Container } from './Container'

export type FooterColumn = {
  heading: string
  children: React.ReactNode
}

export type FooterProps = {
  brand?: React.ReactNode
  columns?: FooterColumn[]
  bottomBar?: React.ReactNode
  className?: string
}

/** Generic marketing footer shell: brand block + link columns + bottom bar. */
export function Footer({ brand, columns = [], bottomBar, className }: FooterProps) {
  return (
    <footer className={cn('border-t border-ds-border-subtle bg-ds-surface-base', className)}>
      <Container>
        <div className="grid gap-10 py-14 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          {brand}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ds-text-secondary">
                {col.heading}
              </h3>
              <div className="mt-4 space-y-2.5 text-sm text-ds-text-secondary">{col.children}</div>
            </div>
          ))}
        </div>
      </Container>
      {bottomBar && (
        <div className="border-t border-ds-border-subtle">
          <Container>
            <div className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-ds-text-muted sm:flex-row">
              {bottomBar}
            </div>
          </Container>
        </div>
      )}
    </footer>
  )
}

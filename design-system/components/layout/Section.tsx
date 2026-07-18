import { cn } from '@/lib/utils'
import { Container, type ContainerProps } from './Container'

const paddingClass = {
  sm: 'py-10 lg:py-12',
  md: 'py-16 lg:py-20',
  lg: 'py-20 lg:py-28',
  xl: 'py-24 lg:py-32',
} as const

const toneClass = {
  base: 'bg-ds-surface-base',
  subtle: 'bg-ds-surface-subtle',
  inverse: 'bg-ds-surface-inverse',
} as const

export type SectionProps = {
  padding?: keyof typeof paddingClass
  tone?: keyof typeof toneClass
  containerSize?: ContainerProps['size']
  /** Render children directly without an inner Container (for full-bleed sections). */
  fullBleed?: boolean
  className?: string
  children: React.ReactNode
}

/** Page-level vertical rhythm unit: consistent padding + tone + content well. */
export function Section({
  padding = 'md',
  tone = 'base',
  containerSize = 'xl',
  fullBleed = false,
  className,
  children,
}: SectionProps) {
  return (
    <section className={cn(paddingClass[padding], toneClass[tone], className)}>
      {fullBleed ? children : <Container size={containerSize}>{children}</Container>}
    </section>
  )
}

import { cn } from '@/lib/utils'
import { Reveal } from '@/components/homepage/reveal'

/**
 * Server-renderable heading shell (the reveal-on-scroll motion lives in
 * the client-only `Reveal` wrapper, imported here so every section keeps
 * one consistent heading rhythm instead of hand-rolling its own).
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  onDark = false,
  className,
  headingId,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  onDark?: boolean
  className?: string
  headingId?: string
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-2.5',
        align === 'center' && 'mx-auto max-w-3xl items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'eyebrow flex items-center gap-3 text-[11px] font-semibold',
            align === 'center' && 'justify-center',
            onDark ? 'text-paper/75' : 'text-primary',
          )}
        >
          <span className={cn('h-px w-8', onDark ? 'bg-paper/40' : 'bg-foreground/30')} />
          {eyebrow}
        </p>
      )}
      <h2
        id={headingId}
        className={cn(
          'text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem]',
          onDark ? 'text-paper' : 'text-foreground',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'max-w-2xl text-pretty text-base leading-relaxed sm:text-lg',
            onDark ? 'text-paper/70' : 'text-muted-foreground',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  )
}

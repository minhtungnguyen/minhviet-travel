import { cn } from '@/lib/utils'
import { Reveal } from './reveal'

export function MVBadge({
  children,
  className,
  tone = 'gold',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'navy' | 'gold' | 'light'
}) {
  const tones = {
    navy: 'bg-secondary text-primary ring-1 ring-primary/10',
    gold: 'bg-gold/10 text-gold ring-1 ring-gold/25',
    light: 'bg-white/10 text-white ring-1 ring-white/25',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Thin uppercase editorial eyebrow with a leading rule. */
export function GoldEyebrow({
  children,
  align = 'left',
  onDark,
  tone = 'navy',
  className,
}: {
  children: React.ReactNode
  align?: 'left' | 'center'
  onDark?: boolean
  /** Light-surface text tone. Gold is reserved for premium/AI-adjacent sections. */
  tone?: 'navy' | 'gold'
  className?: string
}) {
  const toneClass = tone === 'gold' ? 'text-gold' : 'text-primary'
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        align === 'center' && 'justify-center',
        className,
      )}
    >
      <span className={cn('h-px w-8', onDark ? 'bg-paper/40' : 'bg-foreground/30')} />
      <span
        className={cn(
          'eyebrow text-[11px] font-semibold',
          onDark ? 'text-paper/75' : toneClass,
        )}
      >
        {children}
      </span>
      {align === 'center' && (
        <span className={cn('h-px w-8', onDark ? 'bg-paper/40' : 'bg-foreground/30')} />
      )}
    </div>
  )
}

/**
 * Editorial section header. Defaults to a left-aligned layout where the title
 * sits opposite an optional description/action for an asymmetric magazine feel.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  onDark,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  onDark?: boolean
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'mx-auto max-w-3xl items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <GoldEyebrow align={align} onDark={onDark}>
          {eyebrow}
        </GoldEyebrow>
      )}
      <h2
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

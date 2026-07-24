'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'framer-motion'
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe'
import type { VerifiedStat as VerifiedStatType } from '@/types/cms'
import { cn } from '@/lib/utils'

/**
 * Every stat rendered on the homepage goes through this component so a
 * source/asOf citation is always visually present next to the number —
 * the structural fix for the audit's "unsourced stats" finding. The
 * citation is small but never omitted or hidden behind a tooltip.
 */
export function VerifiedStat({
  stat,
  onDark = false,
  className,
}: {
  stat: VerifiedStatType
  onDark?: boolean
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const prefersReducedMotion = useReducedMotionSafe()
  const [display, setDisplay] = useState(prefersReducedMotion ? stat.value : 0)

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return
    const controls = animate(0, stat.value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => setDisplay(Math.round(value)),
    })
    return () => controls.stop()
  }, [isInView, prefersReducedMotion, stat.value])

  return (
    <div className={className}>
      <p
        ref={ref}
        className={cn(
          'font-display text-3xl font-extrabold tracking-tight sm:text-4xl',
          onDark ? 'text-paper' : 'text-mv-brand-blue',
        )}
      >
        {display.toLocaleString('vi-VN')}
        {stat.suffix}
      </p>
      <p className={cn('mt-1 text-sm', onDark ? 'text-paper/60' : 'text-muted-foreground')}>
        {stat.label}
      </p>
      <p className={cn('mt-0.5 text-[11px]', onDark ? 'text-paper/40' : 'text-muted-foreground/70')}>
        Nguồn: {stat.source} · {stat.asOf}
      </p>
    </div>
  )
}

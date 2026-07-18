'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe'

type CountUpProps = {
  /** Numeric target to animate to */
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  /** Thousands separator formatting */
  separator?: boolean
  className?: string
}

export function CountUp({
  value,
  duration = 1800,
  prefix = '',
  suffix = '',
  separator = false,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = useReducedMotionSafe()
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            // easeOutExpo
            const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
            setDisplay(Math.round(eased * value))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration, prefersReducedMotion])

  const displayValue = prefersReducedMotion ? value : display
  const formatted = separator
    ? displayValue.toLocaleString('vi-VN')
    : String(displayValue)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

'use client'

import { motion, useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe'
import { fadeUpVariants } from '@/animations/variants'

/**
 * Framer Motion replacement for the legacy IntersectionObserver-based
 * `components/mv/reveal.tsx`. Kept as a distinct component (not an edit
 * to the legacy one) because other pages still depend on the CSS/IO
 * version — see the redesign plan's Animation Strategy note on staged
 * migration.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variants,
  once = true,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  variants?: Variants
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '0px 0px -80px 0px' })
  const prefersReducedMotion = useReducedMotionSafe()

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants ?? fadeUpVariants(prefersReducedMotion, delay)}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  )
}

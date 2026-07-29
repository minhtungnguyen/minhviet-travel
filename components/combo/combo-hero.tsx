'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowUpRight, BadgeCheck } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { ComboHeroMedia } from '@/components/combo/combo-hero-media'
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe'
import { fadeUpVariants, staggerContainerVariants } from '@/animations/variants'
import type { ComboLandingContent } from '@/types/combo'

/**
 * ~70vh full-bleed hero (brief §Hero) with a light bottom-anchored
 * overlay — not the heavier full-height promotional treatment MICE/
 * Custom-Tour use, since this needs to read as "kỳ nghỉ", not a banner.
 * Text entrance mirrors the flight hero's proven stagger pattern.
 */
export function ComboHero({ hero }: { hero: ComboLandingContent['hero'] }) {
  const prefersReducedMotion = useReducedMotionSafe()

  return (
    <section className="relative h-[75vh] min-h-[560px] overflow-hidden bg-mv-deep-navy sm:h-[82vh] lg:h-[78vh]">
      <ComboHeroMedia video={hero.heroVideo} poster={hero.heroImage} />
      <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/80 via-mv-deep-navy/25 to-transparent" />

      <div className="container-mv relative flex h-full flex-col justify-end pb-12 sm:pb-16 lg:pb-20">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-paper/55" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-paper">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-paper/90">Combo</span>
        </nav>

        <motion.div
          className="max-w-2xl"
          variants={staggerContainerVariants(prefersReducedMotion)}
          initial="hidden"
          animate="visible"
        >
          {hero.eyebrow && (
            <motion.p
              variants={fadeUpVariants(prefersReducedMotion)}
              className="eyebrow flex items-center gap-3 text-[11px] font-semibold text-mv-sky-cyan"
            >
              <span className="h-px w-10 bg-mv-sky-cyan/50" />
              {hero.eyebrow}
            </motion.p>
          )}

          <motion.h1
            variants={fadeUpVariants(prefersReducedMotion)}
            className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.12] tracking-tight text-paper sm:text-5xl lg:text-[3.25rem]"
          >
            {hero.headline}
          </motion.h1>

          <motion.p
            variants={fadeUpVariants(prefersReducedMotion)}
            className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-paper/85"
          >
            {hero.subheadline}
          </motion.p>

          <motion.div variants={fadeUpVariants(prefersReducedMotion)} className="mt-8 flex flex-wrap items-center gap-4">
            <MVButton href={hero.primaryCta.href} variant="accent" size="lg">
              {hero.primaryCta.label} <ArrowUpRight className="size-5" />
            </MVButton>
            <MVButton href={hero.secondaryCta.href} variant="outline-light" size="lg">
              {hero.secondaryCta.label}
            </MVButton>
          </motion.div>

          {hero.trustSignals.length > 0 && (
            <motion.ul
              variants={fadeUpVariants(prefersReducedMotion)}
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {hero.trustSignals.map((signal) => (
                <li key={signal} className="flex items-center gap-2 text-sm text-paper/80">
                  <BadgeCheck className="size-4 text-mv-combo-sunset-light" />
                  {signal}
                </li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </div>
    </section>
  )
}

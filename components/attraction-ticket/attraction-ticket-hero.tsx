'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { AttractionTicketSearchBox, type AttractionSearchFeaturedVenue } from '@/components/attraction-ticket/attraction-ticket-search-box'
import { AttractionCategoryChips, type AttractionCategoryChip } from '@/components/attraction-ticket/attraction-category-chips'
import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe'
import { fadeUpVariants, staggerContainerVariants } from '@/animations/variants'
import type { AttractionSearchCatalog } from '@/lib/attraction-ticket/search-attraction-catalog'

/**
 * Static hero image, not video — no licensed hero footage exists for this
 * module yet (unlike Combo, which sourced and documented one in
 * docs/Handover/Combo/COMBO-MEDIA-REQUIREMENTS.md). See docs/design/
 * mv-ticket/13-asset-library-strategy.md — a Demo Asset shot list still
 * needs sourcing before this placeholder is replaced; not swapped in this
 * pass because that's an asset-sourcing task, not a layout one.
 *
 * Concept 5 "Marketplace Hero" (docs/design/mv-ticket/DESIGN-BIBLE-v1.0.md
 * decisions locked 2026-07-28): ≤60vh, no dark overlay across the photo —
 * legibility comes from a light/frosted panel, not from dimming the image.
 * Search is the panel's dominant element ("Command Center"); Category
 * chips live inside the same panel so both are guaranteed in the first
 * viewport on desktop. AttractionTrustStrip renders immediately below,
 * outside this component, with no gap.
 */
export type AttractionSeasonalBanner = {
  label: string
  href?: string
}

export function AttractionTicketHero({
  categories,
  searchCatalog,
  featuredVenues,
  seasonalBanner = null,
  /**
   * True until a real Demo/Production Asset (docs/design/mv-ticket/13-
   * asset-library-strategy.md) replaces the current Hạ Long Bay landscape
   * photo — which is exactly the "landscape-first, no people, no motion"
   * pattern 07-photography-guideline.md §1 forbids as a hero/card image.
   * Rendering a visible tag here (not just a code comment) is deliberate:
   * it makes the placeholder impossible to miss in a screenshot, a deploy
   * preview, or a live QA pass, so it can never silently ship as final.
   * Flip to `false` the same commit that swaps in a real asset.
   */
  isTemporaryAsset = true,
}: {
  categories: AttractionCategoryChip[]
  searchCatalog: AttractionSearchCatalog
  featuredVenues: AttractionSearchFeaturedVenue[]
  /**
   * Content-driven, not hardcoded — the CMS integration point for a
   * campaign ribbon (Summer/Tết/Christmas, Volume 13 §13.3 "Campaign
   * Accent"). `null` (the default) renders nothing: no fabricated
   * "flash sale" banner without a real campaign behind it (honesty
   * discipline, docs/design/mv-ticket/01-design-direction.md §7). Today
   * the caller passes this from a page-level constant; wiring it to a real
   * CMS content row is a follow-up, not invented here.
   */
  seasonalBanner?: AttractionSeasonalBanner | null
  isTemporaryAsset?: boolean
}) {
  const prefersReducedMotion = useReducedMotionSafe()

  return (
    <section
      data-hero-root
      className="relative flex h-[58vh] min-h-[480px] max-h-[60vh] items-end overflow-hidden bg-mv-deep-navy pb-6 sm:pb-8"
    >
      <Image
        src="/images/hero/ha-long-bay.jpg"
        alt="Du khách trải nghiệm cáp treo vượt biển tại Sun World Hạ Long"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* No dark overlay across the photo (D8/D10 — "không overlay đen") —
          only a short scrim at the very bottom edge, behind the panel, for
          a smooth seam. The photo itself stays fully bright/saturated. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-mv-deep-navy/35 to-transparent" />

      {isTemporaryAsset && (
        <span className="absolute right-3 top-3 z-10 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:right-4 sm:top-16">
          Temporary Asset
        </span>
      )}

      <nav className="absolute inset-x-0 top-5 px-4 sm:top-6" aria-label="Breadcrumb">
        <div className="container-mv flex items-center gap-1.5 text-xs">
          <Link
            href="/"
            className="rounded-full bg-mv-deep-navy/55 px-2.5 py-1 text-paper/85 backdrop-blur-sm transition-colors hover:text-paper"
          >
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 text-paper/70" />
          <span className="rounded-full bg-mv-deep-navy/55 px-2.5 py-1 text-paper/95 backdrop-blur-sm">Vé vui chơi</span>
        </div>
      </nav>

      <div className="container-mv relative w-full">
        <motion.div
          data-hero-panel
          className="mx-auto w-full max-w-2xl rounded-2xl bg-paper/93 p-4 shadow-soft-lg backdrop-blur-md sm:p-6"
          variants={staggerContainerVariants(prefersReducedMotion)}
          initial="hidden"
          animate="visible"
        >
          {seasonalBanner && (
            <motion.div variants={fadeUpVariants(prefersReducedMotion)} className="mb-3 flex justify-center">
              {seasonalBanner.href ? (
                <Link
                  href={seasonalBanner.href}
                  className="rounded-full bg-mv-ticket-orange-light px-3 py-1 text-xs font-semibold text-mv-ticket-orange"
                >
                  {seasonalBanner.label}
                </Link>
              ) : (
                <span className="rounded-full bg-mv-ticket-orange-light px-3 py-1 text-xs font-semibold text-mv-ticket-orange">
                  {seasonalBanner.label}
                </span>
              )}
            </motion.div>
          )}

          <motion.h1
            variants={fadeUpVariants(prefersReducedMotion)}
            className="text-balance text-center font-display text-xl font-extrabold leading-[1.2] tracking-tight text-mv-deep-navy sm:text-2xl"
          >
            Hôm nay bạn muốn vui chơi ở đâu?
          </motion.h1>

          {/* Search — the panel's "Command Center": the single largest, most
              visually dominant control, not a field trailing the headline. */}
          <motion.div variants={fadeUpVariants(prefersReducedMotion)} className="mt-4 flex justify-center">
            <AttractionTicketSearchBox searchCatalog={searchCatalog} featuredVenues={featuredVenues} />
          </motion.div>

          <motion.div variants={fadeUpVariants(prefersReducedMotion)} className="mt-4 flex justify-center">
            <AttractionCategoryChips categories={categories} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/homepage/reveal'
import { MVButton } from '@/components/mv/mv-button'
import type { ComboLandingContent } from '@/types/combo'

/**
 * Section 06 CTA — dark navy banner. Brief specifies `#1F3863`; that hex
 * isn't a live token in `app/globals.css` (only in an unwired
 * MV_Operating_System spec file), so this reuses the existing live
 * `bg-mv-deep-navy` token instead of introducing a new one-off color,
 * per the brief's own "reuse the Design System, don't invent new visual
 * language" instruction.
 */
export function ComboFinalCta({ finalCta }: { finalCta: ComboLandingContent['finalCta'] }) {
  return (
    <section className="bg-mv-deep-navy py-16 lg:py-20">
      <div className="container-mv">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
            {finalCta.headline}
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-paper/78 sm:text-lg">{finalCta.description}</p>
          <div className="mt-8 flex justify-center">
            <MVButton href={finalCta.primaryCta.href} variant="accent" size="lg">
              {finalCta.primaryCta.label} <ArrowUpRight className="size-5" />
            </MVButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

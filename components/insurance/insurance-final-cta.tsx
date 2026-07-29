import { ArrowUpRight, Phone } from 'lucide-react'
import { Reveal } from '@/components/homepage/reveal'
import { MVButton } from '@/components/mv/mv-button'
import type { InsuranceLandingContent } from '@/types/insurance'

/**
 * Dark navy banner — same `bg-mv-deep-navy` treatment every other
 * module's Final CTA uses (Combo, Homepage). This is Brand Foundation
 * (shared structural color), not the module's own Emotion Layer accent —
 * only the Hero gets Insurance's light `mv-mist-blue` treatment.
 */
export function InsuranceFinalCta({ finalCta, provider }: { finalCta: InsuranceLandingContent['finalCta']; provider: InsuranceLandingContent['provider'] }) {
  return (
    <section className="bg-mv-deep-navy py-16 lg:py-20">
      <div className="container-mv">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">{finalCta.headline}</h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-paper/78 sm:text-lg">{finalCta.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MVButton href={finalCta.primaryCta.href} variant="accent" size="lg">
              {finalCta.primaryCta.label} <ArrowUpRight className="size-5" />
            </MVButton>
            <MVButton href={finalCta.secondaryCta.href} variant="outline-light" size="lg">
              {finalCta.secondaryCta.label}
            </MVButton>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-paper/70">
            <Phone className="size-4" />
            Hotline CSKH {provider.name}: {provider.hotline}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

import { ArrowUpRight, Phone } from 'lucide-react'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'
import type { MiceLandingContent } from '@/types/mice'

export function MiceFinalCta({ finalCta }: { finalCta: MiceLandingContent['finalCta'] }) {
  return (
    <section className="border-t border-mv-border-soft bg-gradient-mv-consultation py-16 lg:py-20">
      <div className="container-mv">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            {finalCta.headline}
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-white/78 sm:text-lg">{finalCta.description}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MVButton href={finalCta.primaryCta.href} variant="gold" size="lg">
              {finalCta.primaryCta.label} <ArrowUpRight className="size-5" />
            </MVButton>
            <MVButton href={finalCta.secondaryCta.href} variant="outline-light" size="lg">
              <Phone className="size-4" /> {finalCta.secondaryCta.label}
            </MVButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

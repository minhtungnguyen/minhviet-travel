import { Phone, Search, MessageCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { Reveal } from '@/components/mv/reveal'
import type { FlightHomeContent } from '@/types/flight'

export function FlightFinalCta({ finalCta }: { finalCta: FlightHomeContent['finalCta'] }) {
  return (
    <section className="bg-gradient-mv-consultation section-py-md relative overflow-hidden">
      <div className="container-mv relative">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
            {finalCta.headline}
          </h2>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-white/80">{finalCta.description}</p>

          <p className="flex items-center gap-2 text-sm font-semibold text-white/90">
            <Phone className="size-4 text-mv-sky-cyan" />
            Hotline: <span className="text-white">{finalCta.phone}</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <MVButton href={finalCta.primaryCta.href} variant="accent" size="lg">
              <Search className="size-5" />
              {finalCta.primaryCta.label}
            </MVButton>
            <MVButton href={finalCta.secondaryCta.href} variant="outline-light" size="lg">
              <MessageCircle className="size-5" />
              {finalCta.secondaryCta.label}
            </MVButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

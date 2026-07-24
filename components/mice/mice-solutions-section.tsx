import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'
import type { MiceSolution } from '@/types/mice'

export function MiceSolutionsSection({ solutions }: { solutions: MiceSolution[] }) {
  return (
    <section id="giai-phap-mice" className="section-py-md scroll-mt-20 border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Bốn nhóm giải pháp"
          title="Một khung, bốn hướng triển khai"
          description="Phần lớn chương trình thực tế là sự kết hợp của nhiều nhóm dưới đây, không chỉ một nhóm đơn lẻ."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {solutions.map((s, i) => (
            <Reveal key={s.id} delay={(i % 2) * 80}>
              <article id={s.type} className="scroll-mt-24 flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {s.coverImage && (
                    <Image
                      src={s.coverImage}
                      alt={s.coverImageAlt ?? s.displayName}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-mv-deep-navy/85 via-mv-deep-navy/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-mv-sky-cyan">{s.termEn}</p>
                    <h3 className="mt-1 font-display text-xl font-bold text-white">{s.displayName}</h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-pretty text-sm leading-relaxed text-mv-slate">{s.objective}</p>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">Phù hợp với</p>
                  <p className="mt-1 text-sm text-mv-slate">{s.audienceFit}</p>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">Ứng dụng</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {s.applications.map((a) => (
                      <li key={a} className="rounded-full bg-mv-mist-blue px-2.5 py-1 text-xs font-medium text-mv-deep-navy">
                        {a}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">Cấu phần thường có</p>
                  <p className="mt-1 text-sm text-mv-slate">{s.typicalComponents.join(' · ')}</p>

                  <div className="mt-5 border-t border-border pt-5">
                    <MVButton href="#mice-form" variant="outline" size="sm">
                      {s.ctaLabel} <ArrowUpRight className="size-4" />
                    </MVButton>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

import Image from 'next/image'
import { ArrowUpRight, Clock } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'
import type { MiceProgramIdea } from '@/types/mice'

export function MiceProgramIdeasSection({ ideas }: { ideas: MiceProgramIdea[] }) {
  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Ý tưởng chương trình"
          title="Vài ý tưởng để hình dung"
          description="Các mẫu dưới đây chỉ để gợi ý — không phải bảng giá cố định."
          className="max-w-2xl"
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea, i) => (
            <Reveal key={idea.id} delay={(i % 3) * 60}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {idea.coverImage && (
                    <Image
                      src={idea.coverImage}
                      alt={idea.coverImageAlt ?? idea.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-deep/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    <Clock className="size-3.5" /> {idea.durationLabel}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">{idea.programType}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-mv-deep-navy">{idea.title}</h3>
                  <p className="mt-1 text-sm font-medium text-mv-slate">{idea.subtitle}</p>
                  <p className="mt-2.5 flex-1 text-pretty text-sm leading-relaxed text-mv-slate">
                    {idea.keyComponents.join(' · ')}
                  </p>
                  <div className="mt-4 border-t border-border pt-4">
                    <MVButton href="#mice-form" variant="outline" size="sm">
                      Xem ý tưởng <ArrowUpRight className="size-4" />
                    </MVButton>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-mv-slate">
          Ý tưởng chương trình được điều chỉnh theo quy mô, ngân sách và mục tiêu thực tế.
        </p>
      </div>
    </section>
  )
}

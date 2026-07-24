import Image from 'next/image'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import type { MiceCaseStudy } from '@/types/mice'

const FIELDS: { key: keyof MiceCaseStudy; label: string }[] = [
  { key: 'industry', label: 'Ngành nghề' },
  { key: 'groupSize', label: 'Quy mô đoàn' },
  { key: 'objective', label: 'Mục tiêu' },
  { key: 'solution', label: 'Giải pháp' },
]

export function MiceCaseStudySection({ caseStudies }: { caseStudies: MiceCaseStudy[] }) {
  const study = caseStudies[0]
  if (!study) return null

  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-mist-blue">
      <div className="container-mv">
        <SectionHeader eyebrow="Dự án minh họa" title="Một chương trình được dựng lên như thế nào" className="max-w-2xl" />

        <Reveal>
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              {study.coverImage && (
                <Image src={study.coverImage} alt={study.coverImageAlt ?? study.title} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              )}
            </div>

            <div className="rounded-2xl bg-card p-7 shadow-soft">
              <h3 className="font-display text-xl font-bold text-mv-deep-navy">{study.title}</h3>

              <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">{f.label}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-mv-slate">{String(study[f.key] ?? '')}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 border-t border-border pt-5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-mv-journey-blue">Cấu phần đã triển khai</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {study.componentsDelivered.map((c) => (
                    <span key={c} className="rounded-full bg-mv-mist-blue px-2.5 py-1 text-xs font-medium text-mv-deep-navy">
                      {c}
                    </span>
                  ))}
                </dd>
              </div>

              {study.gallery && study.gallery.length > 0 && (
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {study.gallery.map((img) => (
                    <div key={img.src} className="relative aspect-square overflow-hidden rounded-xl">
                      <Image src={img.src} alt={img.alt} fill sizes="120px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-5 text-xs italic leading-relaxed text-mv-slate/80">{study.disclaimer}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

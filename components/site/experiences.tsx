import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { experiences } from '@/lib/site-data'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'

export function Experiences() {
  const [lead, ...rest] = experiences

  return (
    <section className="border-t border-border bg-sand py-24 lg:py-32">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Lĩnh vực"
          title={
            <>
              Chúng tôi làm gì cho <span className="text-accent">bạn</span>
            </>
          }
          description="Từ tour đoàn doanh nghiệp đến sự kiện quy mô lớn — mỗi dịch vụ đều được thiết kế tỉ mỉ."
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Lead feature */}
          {lead && (
            <Reveal>
              <Link href={lead.href} className="group relative block h-full min-h-[420px] overflow-hidden rounded-2xl shadow-soft">
                <Image
                  src={lead.image || '/placeholder.svg'}
                  alt={lead.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <p className="eyebrow text-[11px] text-paper/70">Nổi bật</p>
                  <h3 className="mt-2 font-display text-3xl text-paper">{lead.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/80">
                    {lead.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-paper">
                    Tìm hiểu thêm
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Supporting list */}
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {rest.map((exp, i) => (
              <Reveal key={exp.title} delay={i * 80} className="flex-1">
                <Link
                  href={exp.href}
                  className="group flex h-full items-center gap-6 py-6"
                >
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={exp.image || '/placeholder.svg'}
                      alt={exp.title}
                      fill
                      sizes="128px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-foreground transition-colors group-hover:text-accent">
                      {exp.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {exp.desc}
                    </p>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

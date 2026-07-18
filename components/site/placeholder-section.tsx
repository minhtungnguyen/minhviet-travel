import { CheckCircle2, Mail, Phone, type LucideIcon } from 'lucide-react'
import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { MVButton } from '@/components/mv/mv-button'

export function PlaceholderSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  highlights,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  highlights: string[]
}) {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="container-mv">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <Reveal>
            <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
              <Icon className="size-7" strokeWidth={1.75} />
            </span>
            <SectionHeader eyebrow={eyebrow} title={title} description={description} className="mt-6" />

            <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold" />
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-3xl bg-gradient-to-br from-navy to-deep p-8 shadow-soft-lg">
              <p className="eyebrow text-[11px] font-semibold text-gold">Cần tư vấn ngay?</p>
              <h3 className="mt-3 text-balance font-display text-xl font-bold text-paper">
                Đội ngũ chuyên viên Minh Việt sẵn sàng hỗ trợ 24/7
              </h3>
              <ul className="mt-6 space-y-4 text-sm text-paper/80">
                <li className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-gold" />
                  <span className="font-semibold text-paper">0934 368 132</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-gold" />
                  info@minhviettravel.com
                </li>
              </ul>
              <MVButton href="/contact" variant="gold" size="md" className="mt-7 w-full">
                Nhận tư vấn giải pháp
              </MVButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

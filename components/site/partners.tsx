import { airlinePartners, hotelPartners } from '@/lib/site-data'
import { Reveal } from '@/components/mv/reveal'

function PartnerRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="grid gap-6 py-10 lg:grid-cols-[240px_1fr] lg:items-center">
      <p className="max-w-[220px] text-pretty text-sm leading-relaxed text-muted-foreground">
        <span className="eyebrow block text-[11px] font-semibold text-primary">{label}</span>
      </p>
      <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
        {items.map((p) => (
          <span
            key={p}
            className="font-display text-lg text-foreground/45 transition-colors hover:text-foreground sm:text-xl"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Partners() {
  return (
    <section className="border-y border-border bg-sand py-8">
      <div className="container-mv">
        <Reveal>
          <div className="divide-y divide-border">
            <PartnerRow label="Đối tác hàng không" items={airlinePartners} />
            <PartnerRow label="Đối tác khách sạn hàng đầu" items={hotelPartners} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

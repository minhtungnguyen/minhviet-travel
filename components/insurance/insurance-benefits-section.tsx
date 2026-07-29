import { HeartPulse, Luggage, Plane, ShieldAlert, ShieldCheck, Siren } from 'lucide-react'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { formatBenefitLimit } from '@/lib/insurance/format-benefit-limit'
import type { BenefitRow } from '@/types/insurance'

/**
 * A curated highlight subset of the full benefit table (structural
 * selection of which real rows to feature, not invented copy) — the full
 * 26+-row table with all 3 plans lives in the Compare Plan section below;
 * this section is meant to be a scannable, above-the-table teaser.
 */
const HIGHLIGHT_CODES: { code: string; icon: typeof ShieldCheck }[] = [
  { code: '1', icon: HeartPulse },
  { code: '6', icon: Siren },
  { code: '5', icon: ShieldAlert },
  { code: '9', icon: ShieldCheck },
  { code: '10', icon: Plane },
  { code: '18', icon: Luggage },
]

/** Shows the highest (Plan C) limit for each highlighted row, in VND — the currency most visitors on this site think in. */
export function InsuranceBenefitsSection({ benefitRows }: { benefitRows: BenefitRow[] }) {
  const byCode = new Map(benefitRows.map((row) => [row.code, row]))
  const highlights = HIGHLIGHT_CODES.map(({ code, icon }) => ({ row: byCode.get(code), icon })).filter(
    (entry): entry is { row: BenefitRow; icon: typeof ShieldCheck } => entry.row !== undefined,
  )

  if (highlights.length === 0) return null

  return (
    <section className="bg-mv-mist-blue/40 py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading
          eyebrow="Quyền lợi bảo hiểm"
          title="Quyền lợi nổi bật"
          description="Trích một số quyền lợi chính (mức Gói C, quyền lợi cao nhất) — xem đầy đủ và so sánh cả 3 gói ở bảng bên dưới."
          align="center"
          className="mx-auto max-w-2xl"
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map(({ row, icon: Icon }, index) => (
            <Reveal key={row.code} delay={index * 60}>
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-card p-6 shadow-soft">
                <div className="grid size-11 place-items-center rounded-xl bg-mv-mist-blue text-mv-journey-blue">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-base font-bold text-mv-deep-navy">{row.label}</h3>
                <p className="mt-auto text-2xl font-extrabold text-mv-journey-blue">{formatBenefitLimit(row.limits.C, 'vnd')}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

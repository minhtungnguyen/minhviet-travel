'use client'

import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs'
import { SectionHeading } from '@/components/homepage/section-heading'
import { formatBenefitLimit } from '@/lib/insurance/format-benefit-limit'
import { cn } from '@/lib/utils'
import type { BenefitRow, InsurancePlanSummary } from '@/types/insurance'

/**
 * Same `data-[active]` fix `consultation-tabs.tsx` already documented:
 * Base UI's Tabs.Tab sets `data-active`, not the `data-selected` the
 * default `TabsTab` classes in `components/ui/tabs.tsx` target — so the
 * active-plan highlight needs its own explicit override here too.
 */
const PLAN_TAB_CLASS =
  'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors outline-none data-[active]:!bg-mv-journey-blue data-[active]:!text-white not-data-[active]:!bg-mv-mist-blue not-data-[active]:!text-mv-deep-navy'

function BenefitLabel({ row }: { row: BenefitRow }) {
  const isSubRow = Boolean(row.parentCode)
  return <span className={cn('text-sm', isSubRow ? 'pl-5 text-muted-foreground' : 'font-semibold text-mv-deep-navy')}>{row.label}</span>
}

/**
 * Desktop/tablet: a real `<table>` inside `overflow-x-auto` (only the
 * table scrolls horizontally, never the page), first column sticky so the
 * benefit name stays visible while comparing plans. Mobile: no existing
 * mobile-table convention in this codebase to reuse, so this swaps to a
 * plan-selector Tabs (one panel per plan) with benefit rows stacked as
 * label→value pairs — avoids shrinking a 3×26-row table into
 * unreadable tiny text.
 */
export function InsuranceCompareTable({ plans, rows, currency = 'vnd' }: { plans: InsurancePlanSummary[]; rows: BenefitRow[]; currency?: 'usd' | 'vnd' }) {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="So sánh gói" title="Bảng so sánh quyền lợi các gói" align="center" className="mx-auto max-w-2xl" />

        {/* Desktop / tablet */}
        <div className="mt-10 hidden overflow-x-auto rounded-2xl border border-border shadow-soft md:block">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-mv-mist-blue/60">
                <th className="sticky left-0 z-10 bg-mv-mist-blue/60 px-4 py-3 text-xs font-bold uppercase tracking-wide text-mv-deep-navy">Quyền lợi</th>
                {plans.map((plan) => (
                  <th key={plan.code} className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-mv-deep-navy">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code} className="border-t border-border odd:bg-card even:bg-mv-mist-blue/20">
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5">
                    <BenefitLabel row={row} />
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.code} className="px-4 py-2.5 text-center text-sm text-foreground">
                      {formatBenefitLimit(row.limits[plan.code], currency)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="mt-10 md:hidden">
          <Tabs defaultValue={plans[0]?.code}>
            <TabsList className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Chọn gói để xem quyền lợi">
              {plans.map((plan) => (
                <TabsTab key={plan.code} value={plan.code} className={PLAN_TAB_CLASS}>
                  {plan.name}
                </TabsTab>
              ))}
            </TabsList>
            {plans.map((plan) => (
              <TabsPanel key={plan.code} value={plan.code} className="mt-4 divide-y divide-border rounded-2xl border border-border">
                {rows.map((row) => (
                  <div key={row.code} className="flex items-center justify-between gap-3 px-4 py-3">
                    <BenefitLabel row={row} />
                    <span className="shrink-0 text-sm font-semibold text-mv-journey-blue">{formatBenefitLimit(row.limits[plan.code], currency)}</span>
                  </div>
                ))}
              </TabsPanel>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  )
}

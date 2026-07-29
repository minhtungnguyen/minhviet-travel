'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, Loader2, MapPin, ShieldCheck, TriangleAlert, Users } from 'lucide-react'
import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MVButton } from '@/components/mv/mv-button'
import { ConsultationTabs } from '@/components/homepage/consultation-tabs'
import { calculatePremium, isPremiumCalculatorError } from '@/lib/insurance/calculate-premium'
import { formatVnd } from '@/lib/flight/flight-format'
import type { FinalCtaContent } from '@/types/homepage'
import type { InsurancePlanCode, InsurancePlanSummary, InsuranceZone, PremiumRate } from '@/types/insurance'

/**
 * Fixed enum → Vietnamese label mapping for the zone select — a UI
 * structural mapping (like a status-badge label table elsewhere in this
 * codebase), not editorial marketing copy, so it's fine to keep local to
 * this component rather than routing through the content service layer.
 */
const ZONE_LABELS: Record<InsuranceZone, string> = {
  SOUTHEAST_ASIA: 'Đông Nam Á',
  ASIA_AUS_NZ: 'Châu Á (trừ Nhật Bản), Úc & New Zealand',
  GLOBAL: 'Toàn cầu',
}

const ZONE_OPTIONS: InsuranceZone[] = ['SOUTHEAST_ASIA', 'ASIA_AUS_NZ', 'GLOBAL']

function formatUsd(amount: number): string {
  return `${amount.toLocaleString('en-US')} USD`
}

/**
 * Section 3 "Form tính phí" — also where both landing CTAs ("Tính phí bảo
 * hiểm ngay" → `#insurance-calculator`, "Liên hệ tư vấn" → the embedded
 * `#insurance-form` further down) converge. Per the confirmed decision:
 * "Mua ngay" does not check out online — it hands the calculated
 * zone/plan/fee off to `ConsultationTabs` → `LeadForm` → `submitLeadAction`
 * as `aiContext`, the same real CRM-lead path every other landing page
 * (Combo, MICE) already uses.
 */
export function InsuranceCalculatorSection({
  plans,
  premiumRates,
  finalCtaContent,
  serviceOptions,
}: {
  plans: InsurancePlanSummary[]
  premiumRates: PremiumRate[]
  finalCtaContent: FinalCtaContent
  serviceOptions: { value: string; label: string }[]
}) {
  const [zone, setZone] = useState<InsuranceZone>('SOUTHEAST_ASIA')
  const [plan, setPlan] = useState<InsurancePlanCode>(plans.find((p) => p.isFeatured)?.code ?? plans[0]?.code ?? 'B')
  const [tripStartDate, setTripStartDate] = useState('')
  const [tripEndDate, setTripEndDate] = useState('')
  const [travelerCount, setTravelerCount] = useState(1)
  const [isFamily, setIsFamily] = useState(false)

  const result = useMemo(() => {
    if (!tripStartDate || !tripEndDate) return null
    return calculatePremium({ zone, plan, tripStartDate, tripEndDate, travelerCount, isFamily }, premiumRates)
  }, [zone, plan, tripStartDate, tripEndDate, travelerCount, isFamily, premiumRates])

  const successResult = result && !isPremiumCalculatorError(result) ? result : null

  const aiContext = successResult
    ? `Bảo hiểm du lịch — Gói ${plan} · ${ZONE_LABELS[zone]} · ${successResult.durationDays} ngày · ${travelerCount} người${isFamily ? ' (gia đình)' : ''} · Phí ước tính ${formatVnd(successResult.totalPremium.vnd)} (${formatUsd(successResult.totalPremium.usd)})`
    : undefined

  return (
    <section id="insurance-calculator" className="scroll-mt-20 bg-mv-mist-blue/30 py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Tính phí bảo hiểm" title="Tính phí bảo hiểm du lịch của bạn" description="Chọn phạm vi, gói và thời gian chuyến đi để xem phí bảo hiểm ước tính ngay." align="center" className="mx-auto max-w-2xl" />

        <Reveal className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-soft sm:p-8">
            <Field>
              <FieldLabel>Phạm vi địa lý</FieldLabel>
              <Select value={zone} onValueChange={(value) => setZone(value as InsuranceZone)}>
                <SelectTrigger aria-label="Phạm vi địa lý">
                  <span className="flex min-w-0 items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      <SelectValue placeholder="Chọn phạm vi địa lý">{(selected: InsuranceZone) => ZONE_LABELS[selected]}</SelectValue>
                    </span>
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {ZONE_OPTIONS.map((z) => (
                    <SelectItem key={z} value={z}>
                      {ZONE_LABELS[z]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Gói bảo hiểm</FieldLabel>
              <Select value={plan} onValueChange={(value) => setPlan(value as InsurancePlanCode)}>
                <SelectTrigger aria-label="Gói bảo hiểm">
                  <span className="flex min-w-0 items-center gap-2">
                    <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      <SelectValue placeholder="Chọn gói bảo hiểm">{(selected: InsurancePlanCode) => plans.find((p) => p.code === selected)?.name ?? selected}</SelectValue>
                    </span>
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name} — {p.tagline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Ngày khởi hành</FieldLabel>
                <Input type="date" value={tripStartDate} onChange={(e) => setTripStartDate(e.target.value)} aria-label="Ngày khởi hành" />
              </Field>
              <Field>
                <FieldLabel>Ngày về</FieldLabel>
                <Input type="date" value={tripEndDate} min={tripStartDate || undefined} onChange={(e) => setTripEndDate(e.target.value)} aria-label="Ngày về" />
              </Field>
            </div>

            <Field>
              <FieldLabel>Số người</FieldLabel>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  min={isFamily ? 2 : 1}
                  value={travelerCount}
                  onChange={(e) => setTravelerCount(Math.max(isFamily ? 2 : 1, Number(e.target.value) || 1))}
                  className="pl-10"
                  aria-label="Số người"
                />
              </div>
            </Field>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isFamily}
                onChange={(e) => {
                  setIsFamily(e.target.checked)
                  if (e.target.checked && travelerCount < 2) setTravelerCount(2)
                }}
                className="size-4 rounded border-border accent-mv-journey-blue"
              />
              Mua theo gói gia đình (bố/mẹ và các con hợp pháp)
            </label>
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-mv-deep-navy p-6 text-paper sm:p-8">
            {!tripStartDate || !tripEndDate ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-paper/70">
                <CalendarDays className="size-8" strokeWidth={1.5} />
                <p className="text-sm">Chọn ngày khởi hành và ngày về để xem phí ước tính.</p>
              </div>
            ) : result && isPremiumCalculatorError(result) ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-paper/85">
                <TriangleAlert className="size-8 text-mv-ticket-orange" strokeWidth={1.5} />
                <p className="text-sm">
                  {result.code === 'INVALID_DATES' && 'Ngày về phải sau ngày khởi hành.'}
                  {result.code === 'DURATION_OUT_OF_RANGE' && `Chuyến đi ${result.days} ngày vượt quá thời hạn bảo hiểm tối đa (180 ngày).`}
                  {result.code === 'RATE_NOT_FOUND' && 'Không tìm thấy mức phí phù hợp — vui lòng thử lại hoặc liên hệ tư vấn.'}
                </p>
              </div>
            ) : successResult ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-paper/60">
                  Gói {plan} · {ZONE_LABELS[zone]} · {successResult.durationDays} ngày
                </p>
                <div>
                  <p className="text-xs text-paper/60">{isFamily ? `Phí cho ${travelerCount} người (gia đình)` : 'Phí bảo hiểm'}</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-paper">{formatVnd(successResult.totalPremium.vnd)}</p>
                  <p className="text-sm text-paper/70">{formatUsd(successResult.totalPremium.usd)}</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <MVButton href="#insurance-form" variant="accent" size="lg">
                    Mua ngay
                  </MVButton>
                  <MVButton href="#insurance-form" variant="outline-light" size="lg">
                    Liên hệ tư vấn
                  </MVButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-2 text-paper/70">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">Đang tính phí...</span>
              </div>
            )}
          </div>
        </Reveal>

      </div>

      <div id="insurance-form" className="scroll-mt-20 mt-16 bg-mv-deep-navy py-16 lg:py-20">
        <div className="container-mv">
          <SectionHeading eyebrow="Gửi yêu cầu" title="Mua bảo hiểm hoặc nhận tư vấn" onDark align="center" className="mx-auto mb-8 max-w-xl" />
          <div className="mx-auto max-w-xl">
            <ConsultationTabs
              content={finalCtaContent}
              serviceOptions={serviceOptions}
              defaultTab="individual"
              prefill={{
                source: 'INSURANCE_LANDING',
                landingIntent: 'INSURANCE',
                serviceType: 'INSURANCE',
                defaultServiceInterest: 'insurance',
                aiContext,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

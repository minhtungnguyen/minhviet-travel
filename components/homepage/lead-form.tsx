'use client'

import { CheckCircle2, TriangleAlert } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useLeadForm } from '@/hooks/use-lead-form'

export function LeadForm({
  intent,
  serviceOptions,
  aiContext,
  source,
  landingIntent,
  serviceType,
  audienceType,
  defaultServiceInterest,
  showEventDetails = false,
}: {
  intent: 'corporate' | 'individual'
  serviceOptions: { value: string; label: string }[]
  aiContext?: string
  /** CRM origin tag, e.g. "CUSTOM_TOUR_LANDING". Defaults server-side to "homepage" when omitted. */
  source?: string
  /** CRM routing tag distinct from `intent` (which is the corporate/individual panel choice), e.g. "CUSTOM_DESIGN". */
  landingIntent?: string
  serviceType?: string
  /** e.g. "ORGANIZATION" — a coarser CRM segment than `intent`, set by a landing page. */
  audienceType?: string
  /** Overrides the "Nhu cầu quan tâm" select's default selection — must match one of `serviceOptions`' values. */
  defaultServiceInterest?: string
  /**
   * Renders 4 extra optional inputs (guest count / date / location /
   * budget) under a "Thông tin bổ sung" group — off by default so the
   * Homepage and `/tour-thiet-ke` forms are unaffected; the `/mice`
   * landing page turns it on for a richer V1 form per its brief §XVII.
   */
  showEventDetails?: boolean
}) {
  const { state, formAction, isPending } = useLeadForm()

  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 text-center shadow-soft-lg">
        <span className="grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="font-display text-lg font-bold text-mv-deep-navy">Đã ghi nhận yêu cầu</p>
        <p className="max-w-sm text-sm text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-soft-lg sm:p-8">
      <input type="hidden" name="intent" value={intent} />
      {aiContext && <input type="hidden" name="aiContext" value={aiContext} />}
      {source && <input type="hidden" name="source" value={source} />}
      {landingIntent && <input type="hidden" name="landingIntent" value={landingIntent} />}
      {serviceType && <input type="hidden" name="serviceType" value={serviceType} />}
      {audienceType && <input type="hidden" name="audienceType" value={audienceType} />}

      {state.status === 'error' && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="fullName" invalid={Boolean(fieldErrors?.fullName)}>
          <FieldLabel>Họ và tên *</FieldLabel>
          <Input name="fullName" required aria-invalid={Boolean(fieldErrors?.fullName)} />
        </Field>
        {intent === 'corporate' && (
          <Field name="organization">
            <FieldLabel>Đơn vị / Doanh nghiệp</FieldLabel>
            <Input name="organization" />
          </Field>
        )}
        <Field name="email" invalid={Boolean(fieldErrors?.email)}>
          <FieldLabel>Email *</FieldLabel>
          <Input name="email" type="email" required aria-invalid={Boolean(fieldErrors?.email)} />
        </Field>
        <Field name="phone" invalid={Boolean(fieldErrors?.phone)}>
          <FieldLabel>Số điện thoại *</FieldLabel>
          <Input name="phone" type="tel" required aria-invalid={Boolean(fieldErrors?.phone)} />
        </Field>
      </div>

      <Field name="serviceInterest">
        <FieldLabel>Nhu cầu quan tâm</FieldLabel>
        <Select name="serviceInterest" defaultValue={defaultServiceInterest ?? serviceOptions[0]?.value ?? null}>
          <SelectTrigger aria-label="Nhu cầu quan tâm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {serviceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {showEventDetails && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Thông tin bổ sung (không bắt buộc)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="eventGuestCount">
              <FieldLabel>Số lượng khách dự kiến</FieldLabel>
              <Input name="eventGuestCount" placeholder="Ví dụ: 150 khách" />
            </Field>
            <Field name="eventDate">
              <FieldLabel>Thời gian dự kiến</FieldLabel>
              <Input name="eventDate" placeholder="Ví dụ: Quý 3/2026" />
            </Field>
            <Field name="eventLocation">
              <FieldLabel>Địa điểm dự kiến</FieldLabel>
              <Input name="eventLocation" placeholder="Ví dụ: Hạ Long, Đà Nẵng..." />
            </Field>
            <Field name="eventBudget">
              <FieldLabel>Ngân sách dự kiến</FieldLabel>
              <Input name="eventBudget" placeholder="Ví dụ: 500 triệu" />
            </Field>
          </div>
        </div>
      )}

      <Field name="message">
        <FieldLabel>{showEventDetails ? 'Nội dung yêu cầu / Mục tiêu chương trình' : 'Nội dung yêu cầu'}</FieldLabel>
        <Textarea name="message" rows={4} />
      </Field>

      <Button type="submit" variant="journey" size="lg" className="mt-2 w-full sm:w-auto" disabled={isPending}>
        {isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
      </Button>
    </form>
  )
}

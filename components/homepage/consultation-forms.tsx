import { Phone, MessageCircle } from 'lucide-react'
import { LeadForm } from '@/components/homepage/lead-form'
import type { FinalCtaContent } from '@/types/homepage'

type ConsultationCopy = FinalCtaContent['corporate'] | FinalCtaContent['individual']

/**
 * Shared render for both consultation form panels — the two exported
 * components below are thin, intent-specific wrappers around this so
 * `OrganizationConsultationForm`/`IndividualConsultationForm` exist as
 * named components (per Sprint UI-03 §IX) without duplicating markup.
 * Submit logic is untouched: both still go through the existing
 * `LeadForm` -> `useLeadForm` -> `submitLeadAction` path.
 */
type FormPrefill = {
  source?: string
  landingIntent?: string
  serviceType?: string
  audienceType?: string
  defaultServiceInterest?: string
  showEventDetails?: boolean
  /** Forwarded straight to `LeadForm`'s own `aiContext` prop — e.g. the /insurance calculator's computed zone/plan/fee summary. */
  aiContext?: string
}

function ConsultationFormPanel({
  copy,
  intent,
  serviceOptions,
  phone,
  zaloHref,
  prefill,
}: {
  copy: ConsultationCopy
  intent: 'corporate' | 'individual'
  serviceOptions: { value: string; label: string }[]
  phone: string
  zaloHref: string
  prefill?: FormPrefill
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="eyebrow text-[11px] font-semibold text-mv-sky-cyan">{copy.eyebrow}</p>
        <h2 className="mt-2 text-balance font-display text-2xl font-bold leading-tight text-white sm:text-[1.75rem]">
          {copy.title}
        </h2>
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-white/78">{copy.description}</p>
      </div>

      <LeadForm intent={intent} serviceOptions={serviceOptions} {...prefill} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-semibold text-white/85">
        <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-mv-sky-cyan">
          <Phone className="size-4 text-mv-sky-cyan" /> Hotline 24/7 {phone}
        </a>
        <span className="hidden h-4 w-px bg-white/20 sm:block" />
        <a href={zaloHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-mv-sky-cyan">
          <MessageCircle className="size-4 text-mv-sky-cyan" /> Zalo
        </a>
      </div>
    </div>
  )
}

export function OrganizationConsultationForm({
  content,
  serviceOptions,
  phone,
  zaloHref,
  prefill,
}: {
  content: FinalCtaContent
  serviceOptions: { value: string; label: string }[]
  phone: string
  zaloHref: string
  prefill?: FormPrefill
}) {
  return (
    <ConsultationFormPanel
      copy={content.corporate}
      intent="corporate"
      serviceOptions={serviceOptions}
      phone={phone}
      zaloHref={zaloHref}
      prefill={prefill}
    />
  )
}

export function IndividualConsultationForm({
  content,
  serviceOptions,
  phone,
  zaloHref,
  prefill,
}: {
  content: FinalCtaContent
  serviceOptions: { value: string; label: string }[]
  phone: string
  zaloHref: string
  prefill?: FormPrefill
}) {
  return (
    <ConsultationFormPanel
      copy={content.individual}
      intent="individual"
      serviceOptions={serviceOptions}
      phone={phone}
      zaloHref={zaloHref}
      prefill={prefill}
    />
  )
}

'use client'

import { Phone, MessageCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs'
import { LeadForm } from '@/components/homepage/lead-form'
import type { FinalCtaContent } from '@/types/homepage'

/**
 * `components/ui/tabs.tsx`'s default styling targets a `data-selected`
 * attribute that Base UI's Tabs never actually sets (it sets
 * `data-active` — confirmed by inspecting the rendered DOM), so the
 * active/inactive visual distinction silently never applied. Targeting
 * `data-[active]` here instead of patching the shared primitive keeps
 * this fix scoped to the consultation-form section only.
 */
/**
 * `!` (important) on the color/background utilities because the base
 * `TabsTab` class list already ships a `not-data-[selected]:text-*`
 * rule that — being an always-true dead condition (see note above) —
 * has equal specificity and unpredictable Tailwind source-order
 * precedence against a same-property class here; important pins the
 * intended color regardless of generated CSS order.
 */
const TAB_TRIGGER_CLASS =
  'rounded-full px-6 py-2.5 text-sm font-semibold normal-case tracking-normal transition-colors outline-none data-[active]:!bg-white data-[active]:!text-primary data-[active]:shadow-soft not-data-[active]:!text-paper/70 not-data-[active]:hover:!text-paper focus-visible:ring-2 focus-visible:ring-accent/60'

/**
 * Single form, two tabs — showing the corporate and individual forms
 * side by side at once (the previous desktop layout) doubled the
 * section's visual weight for no benefit; only one form is ever
 * relevant to a given visitor. Corporate is the default tab (Volume 01
 * Ch.8 keeps Corporate Excellence the priority persona).
 */
export function DualPathCta({
  content,
  serviceOptions,
}: {
  content: FinalCtaContent
  serviceOptions: { value: string; label: string }[]
}) {
  return (
    <div id="lead-form" className="flex flex-col items-center gap-6">
      <Tabs defaultValue="corporate" className="w-full max-w-2xl">
        <TabsList className="mx-auto flex w-fit rounded-full bg-white/10 p-1" aria-label="Chọn loại yêu cầu tư vấn">
          <TabsTab value="corporate" className={TAB_TRIGGER_CLASS}>
            {content.corporate.label}
          </TabsTab>
          <TabsTab value="individual" className={TAB_TRIGGER_CLASS}>
            {content.individual.label}
          </TabsTab>
        </TabsList>

        <TabsPanel value="corporate" className="mt-6 min-h-[560px] sm:min-h-[520px]">
          <PathBlock
            title={content.corporate.title}
            description={content.corporate.description}
            intent="corporate"
            serviceOptions={serviceOptions}
          />
        </TabsPanel>
        <TabsPanel value="individual" className="mt-6 min-h-[560px] sm:min-h-[520px]">
          <PathBlock
            title={content.individual.title}
            description={content.individual.description}
            intent="individual"
            serviceOptions={serviceOptions}
          />
        </TabsPanel>
      </Tabs>

      <div className="flex items-center gap-3 text-sm font-semibold text-paper">
        <a href={`tel:${content.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-accent">
          <Phone className="size-4 text-accent" /> Hotline 24/7 {content.phone}
        </a>
        <span className="h-4 w-px bg-paper/20" />
        <a href={content.zaloHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-accent">
          <MessageCircle className="size-4 text-accent" /> Zalo
        </a>
      </div>
    </div>
  )
}

function PathBlock({
  title,
  description,
  intent,
  serviceOptions,
}: {
  title: string
  description: string
  intent: 'corporate' | 'individual'
  serviceOptions: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <h3 className="font-display text-xl font-bold text-paper">{title}</h3>
        <p className="mt-1.5 text-sm text-paper/70">{description}</p>
      </div>
      <LeadForm intent={intent} serviceOptions={serviceOptions} />
    </div>
  )
}

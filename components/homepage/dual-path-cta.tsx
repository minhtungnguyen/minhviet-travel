'use client'

import { Phone, MessageCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs'
import { LeadForm } from '@/components/homepage/lead-form'
import type { FinalCtaContent } from '@/types/homepage'

/**
 * Desktop shows both paths side by side (Corporate Excellence stays the
 * priority persona per Volume 01 Ch.8, so it renders first); mobile
 * switches between them with tabs to control scroll length, matching
 * the approved Mobile Layout spec.
 */
export function DualPathCta({
  content,
  serviceOptions,
}: {
  content: FinalCtaContent
  serviceOptions: { value: string; label: string }[]
}) {
  return (
    <div id="lead-form" className="flex flex-col gap-8">
      <div className="hidden gap-8 md:grid md:grid-cols-2">
        <PathBlock
          eyebrow={content.corporate.label}
          title={content.corporate.title}
          description={content.corporate.description}
          intent="corporate"
          serviceOptions={serviceOptions}
        />
        <PathBlock
          eyebrow={content.individual.label}
          title={content.individual.title}
          description={content.individual.description}
          intent="individual"
          serviceOptions={serviceOptions}
        />
      </div>

      <div className="md:hidden">
        <Tabs defaultValue="corporate">
          <TabsList className="mb-5 grid grid-cols-2">
            <TabsTab value="corporate">{content.corporate.label}</TabsTab>
            <TabsTab value="individual">{content.individual.label}</TabsTab>
          </TabsList>
          <TabsPanel value="corporate">
            <PathBlock
              title={content.corporate.title}
              description={content.corporate.description}
              intent="corporate"
              serviceOptions={serviceOptions}
            />
          </TabsPanel>
          <TabsPanel value="individual">
            <PathBlock
              title={content.individual.title}
              description={content.individual.description}
              intent="individual"
              serviceOptions={serviceOptions}
            />
          </TabsPanel>
        </Tabs>
      </div>

      <div className="flex items-center gap-3 text-sm font-semibold text-paper">
        <a href={`tel:${content.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-gold">
          <Phone className="size-4 text-gold" /> Hotline 24/7 {content.phone}
        </a>
        <span className="h-4 w-px bg-paper/20" />
        <a href={content.zaloHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
          <MessageCircle className="size-4 text-gold" /> Zalo
        </a>
      </div>
    </div>
  )
}

function PathBlock({
  eyebrow,
  title,
  description,
  intent,
  serviceOptions,
}: {
  eyebrow?: string
  title: string
  description: string
  intent: 'corporate' | 'individual'
  serviceOptions: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        {eyebrow && <p className="eyebrow text-[11px] font-semibold text-gold">{eyebrow}</p>}
        <h3 className="mt-2 font-display text-xl font-bold text-paper">{title}</h3>
        <p className="mt-2 text-sm text-paper/70">{description}</p>
      </div>
      <LeadForm intent={intent} serviceOptions={serviceOptions} />
    </div>
  )
}

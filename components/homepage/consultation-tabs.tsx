'use client'

import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs'
import { OrganizationConsultationForm, IndividualConsultationForm } from '@/components/homepage/consultation-forms'
import type { FinalCtaContent } from '@/types/homepage'

/**
 * Targets `data-[active]` (not `data-[selected]`) — the real attribute
 * Base UI's Tabs.Tab sets on activation, confirmed by inspecting the
 * rendered DOM. `components/ui/tabs.tsx`'s own default classes target
 * `data-selected`, which Base UI never sets (see CHANGELOG_UI_01.md,
 * Sprint UI-01 "Hotfix — Consultation Form Tabs"), so that default is
 * dead code here too and gets fully overridden with `!important`.
 */
/**
 * `whitespace-nowrap` + `shrink-0` are load-bearing: without them, the
 * full-length Vietnamese labels wrap inside the fixed-height pill at
 * narrow widths and visually clip (only the last line stays inside the
 * pill's box) instead of growing the pill taller. Letting `TabsList`
 * scroll horizontally (below) is the trade-off that avoids that.
 */
const TAB_TRIGGER_CLASS =
  'shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-mv-fast outline-none data-[active]:!bg-white data-[active]:!text-mv-deep-navy data-[active]:shadow-soft not-data-[active]:!text-white/70 not-data-[active]:hover:!text-white focus-visible:ring-2 focus-visible:ring-mv-sky-cyan/60'

/**
 * `keepMounted` on both panels is the fix for the brief's "không mất dữ
 * liệu đã nhập nếu người dùng chuyển tab rồi quay lại" requirement — Base
 * UI's default behavior unmounts the inactive panel (confirmed in
 * CHANGELOG_UI_01.md's Sprint UI-01 hotfix note), which would silently
 * wipe any half-filled field the moment someone switched tabs. With
 * `keepMounted`, the inactive form stays in the DOM (hidden via the
 * primitive's own `hidden` attribute — real display:none, not a fake
 * div toggle) so its uncontrolled input values survive the switch.
 * `role`/`aria-selected`/`aria-controls`/id pairing and ArrowLeft/Right +
 * Enter/Space keyboard activation all come from the primitive itself.
 */
export function ConsultationTabs({
  content,
  serviceOptions,
  defaultTab = 'organization',
  prefill,
}: {
  content: FinalCtaContent
  serviceOptions: { value: string; label: string }[]
  /** Which tab opens by default — a landing page whose audience is exclusively organizations can still show both tabs but start on "organization". */
  defaultTab?: 'organization' | 'individual'
  /** CRM-routing metadata forwarded as hidden fields on whichever panel the visitor submits — see `LeadForm`. */
  prefill?: {
    source?: string
    landingIntent?: string
    serviceType?: string
    audienceType?: string
    defaultServiceInterest?: string
    showEventDetails?: boolean
  }
}) {
  return (
    <Tabs defaultValue={defaultTab} className="flex flex-col gap-5">
      <TabsList
        className="inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-full bg-white/10 p-1 [scrollbar-width:none] sm:w-fit [&::-webkit-scrollbar]:hidden"
        aria-label="Chọn loại yêu cầu tư vấn"
      >
        <TabsTab value="organization" className={TAB_TRIGGER_CLASS}>
          {content.corporate.label}
        </TabsTab>
        <TabsTab value="individual" className={TAB_TRIGGER_CLASS}>
          {content.individual.label}
        </TabsTab>
      </TabsList>

      <TabsPanel value="organization" keepMounted>
        <OrganizationConsultationForm
          content={content}
          serviceOptions={serviceOptions}
          phone={content.phone}
          zaloHref={content.zaloHref}
          prefill={prefill}
        />
      </TabsPanel>
      <TabsPanel value="individual" keepMounted>
        <IndividualConsultationForm
          content={content}
          serviceOptions={serviceOptions}
          phone={content.phone}
          zaloHref={content.zaloHref}
          prefill={prefill}
        />
      </TabsPanel>
    </Tabs>
  )
}

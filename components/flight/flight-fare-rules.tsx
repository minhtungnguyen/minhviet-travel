import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import { formatVnd } from '@/lib/flight/flight-format'
import type { FareOption, FlightFareRules } from '@/types/flight'

/** Fare Rules (EPIC-003 §4.5) — flight-level policy text plus the selected fare tier's specific change/refund fee. Accordion on all breakpoints (mobile requirement, kept consistent on desktop). */
export function FlightFareRulesSection({ fareRules, selectedFareOption }: { fareRules: FlightFareRules; selectedFareOption: FareOption }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-3 font-display text-base font-bold text-foreground">Điều kiện vé</p>
      <Accordion className="rounded-xl border border-border px-4">
        <AccordionItem value="change">
          <AccordionTrigger>Đổi vé</AccordionTrigger>
          <AccordionPanel>
            <p>{fareRules.changeConditions}</p>
            <p className="mt-1.5 font-medium text-foreground">
              Hạng vé đã chọn: {selectedFareOption.changePolicy}
              {selectedFareOption.changeFee !== null && selectedFareOption.changeFee > 0 && ` — phí ${formatVnd(selectedFareOption.changeFee)}`}
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="refund">
          <AccordionTrigger>Hoàn vé</AccordionTrigger>
          <AccordionPanel>
            <p>{fareRules.refundConditions}</p>
            <p className="mt-1.5 font-medium text-foreground">
              Hạng vé đã chọn: {selectedFareOption.refundPolicy}
              {selectedFareOption.refundFee !== null && selectedFareOption.refundFee > 0 && ` — phí ${formatVnd(selectedFareOption.refundFee)}`}
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="no-show">
          <AccordionTrigger>Không có mặt (No-show)</AccordionTrigger>
          <AccordionPanel>{fareRules.noShowPolicy}</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="hold">
          <AccordionTrigger>Thời hạn giữ chỗ</AccordionTrigger>
          <AccordionPanel>Giá vé và chỗ trống được giữ trong {fareRules.holdDeadlineMinutes} phút kể từ khi bắt đầu đặt vé.</AccordionPanel>
        </AccordionItem>
      </Accordion>
      <p className="mt-3 text-xs text-muted-foreground">{fareRules.priceDisclaimer}</p>
    </div>
  )
}

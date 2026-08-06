import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import type { ItineraryDay } from '@/lib/tours/public-tours'

export function TourItinerary({ days }: { days: ItineraryDay[] }) {
  return (
    <Accordion defaultValue={[days[0]?.day]}>
      {days.map((day) => (
        <AccordionItem key={day.day} value={day.day}>
          <AccordionTrigger>
            <span className="flex items-center gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-bold text-primary">
                {day.day}
              </span>
              <span>
                Ngày {day.day}: {day.title}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionPanel>
            <p className="pl-[3.1rem]">{day.description}</p>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import type { FlightFaq } from '@/types/flight'

/**
 * Single-open accordion (EPIC-001 §3.8) — Base UI's Accordion defaults to
 * `multiple: false`, so no extra prop is needed. `question`/`answer` are
 * also emitted as `FAQPage` JSON-LD by `FlightHomeJsonLd` (§6).
 */
export function FlightFaqSection({ faqs }: { faqs: FlightFaq[] }) {
  const activeFaqs = faqs.filter((faq) => faq.isActive).sort((a, b) => a.order - b.order)

  return (
    <section className="section-py-md border-t border-border bg-mv-ice-blue">
      <div className="container-mv">
        <SectionHeader
          eyebrow="Câu hỏi thường gặp"
          title="Những điều bạn hay thắc mắc khi đặt vé máy bay"
          className="max-w-2xl"
        />

        {activeFaqs.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">Câu hỏi thường gặp đang được cập nhật.</p>
        ) : (
          <Reveal className="mt-10 max-w-3xl">
            <Accordion className="rounded-2xl bg-card px-6 shadow-soft">
              {activeFaqs.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionPanel>{item.answer}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        )}
      </div>
    </section>
  )
}

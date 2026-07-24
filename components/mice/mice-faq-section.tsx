import { SectionHeader } from '@/components/mv/section'
import { Reveal } from '@/components/mv/reveal'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import type { MiceFAQ } from '@/types/mice'

/**
 * `question`/`answer` are plain strings — schema-ready for a future
 * `FAQPage` JSON-LD block. Structured data is intentionally NOT added
 * here yet (brief §XVI: "không tạo FAQ structured data ... nếu hệ thống
 * SEO chưa hỗ trợ") — see the output doc for what wiring it later needs.
 */
export function MiceFaqSection({ faqs }: { faqs: MiceFAQ[] }) {
  return (
    <section className="section-py-md border-t border-border bg-background">
      <div className="container-mv">
        <SectionHeader eyebrow="Câu hỏi thường gặp" title="Những điều doanh nghiệp hay hỏi về MICE" className="max-w-2xl" />

        <Reveal className="mt-10 max-w-3xl">
          <Accordion className="rounded-2xl bg-card px-6 shadow-soft">
            {faqs.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionPanel>{item.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}

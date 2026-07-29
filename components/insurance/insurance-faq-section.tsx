import { SectionHeading } from '@/components/homepage/section-heading'
import { Reveal } from '@/components/homepage/reveal'
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from '@/components/ui/accordion'
import type { InsuranceFaqItem } from '@/types/insurance'

export function InsuranceFaqSection({ faqs }: { faqs: InsuranceFaqItem[] }) {
  if (faqs.length === 0) return null

  return (
    <section className="bg-mv-mist-blue/40 py-16 lg:py-24">
      <div className="container-mv">
        <SectionHeading eyebrow="Câu hỏi thường gặp" title="Những điều bạn hay thắc mắc" align="center" className="mx-auto max-w-2xl" />

        <Reveal className="mx-auto mt-10 max-w-3xl">
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

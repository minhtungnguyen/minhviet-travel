import { getHomepageContent } from '@/lib/cms/client'
import { SectionHeading } from '@/components/homepage/section-heading'
import { AIAdvisorForm } from '@/components/homepage/ai-advisor-form'
import { Reveal } from '@/components/homepage/reveal'
import { Info } from 'lucide-react'

/**
 * A real, working entry point — the audit's most serious AI-experience
 * finding was that the previous AI panel was a static mockup with
 * fabricated confidence scores and no functioning input. This section
 * runs the real matching engine in `lib/ai/match-engine.ts`.
 */
export async function AIAdvisorSection() {
  const { aiAdvisor } = await getHomepageContent()

  return (
    <section id="ai-advisor" className="scroll-mt-24 border-t border-border bg-background py-24 lg:py-28">
      <div className="container-mv">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={aiAdvisor.eyebrow}
              title={
                <>
                  {aiAdvisor.title} <span className="text-primary">{aiAdvisor.titleAccent}</span>
                </>
              }
              description={aiAdvisor.description}
            />
            <Reveal delay={0.1} className="mt-6 flex items-start gap-2.5 rounded-xl border border-royal/20 bg-royal/5 p-3.5 text-xs text-foreground/80">
              <Info className="mt-0.5 size-4 shrink-0 text-royal" />
              <p>{aiAdvisor.disclosureNote}</p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="rounded-3xl border border-border bg-card p-6 shadow-soft-lg sm:p-8">
            <AIAdvisorForm questions={aiAdvisor.questions} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

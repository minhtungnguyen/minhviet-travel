import Image from 'next/image'
import { Quote } from 'lucide-react'
import { getHomepageContent } from '@/lib/cms/client'
import { Reveal } from '@/components/homepage/reveal'

/**
 * New in Sprint 2 ("Make the CMS usable"). Renders nothing until a real
 * leadership quote/name is entered through the Admin CMS editor — no
 * placeholder name or fabricated quote ships as seed content (see
 * database/seeds/0012_homepage_cms_content.sql).
 */
export async function CeoSection() {
  const { ceoSection } = await getHomepageContent()
  if (!ceoSection.quote || !ceoSection.name) return null

  return (
    <section className="section-py-md border-t border-mv-border-soft bg-mv-mist-blue">
      <div className="container-mv">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
            {ceoSection.portrait && (
              <Image
                src={ceoSection.portrait.src}
                alt={ceoSection.portrait.alt}
                width={ceoSection.portrait.width}
                height={ceoSection.portrait.height}
                className="size-24 shrink-0 rounded-full object-cover shadow-soft-lg sm:size-28"
              />
            )}
            <div>
              {ceoSection.eyebrow && (
                <p className="eyebrow text-[11px] font-semibold text-mv-journey-blue">{ceoSection.eyebrow}</p>
              )}
              <Quote className="mx-auto mt-3 size-6 text-mv-sky-cyan sm:mx-0" />
              <p className="mt-3 text-balance font-display text-xl leading-snug text-mv-deep-navy sm:text-2xl">
                {ceoSection.quote}
              </p>
              <p className="mt-4 font-semibold text-mv-deep-navy">{ceoSection.name}</p>
              {ceoSection.title && <p className="text-sm text-mv-slate">{ceoSection.title}</p>}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

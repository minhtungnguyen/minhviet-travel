import Image from 'next/image'
import { MVButton } from '@/components/mv/mv-button'
import type { CmsBlock, CmsSection } from '@/modules/cms/domain/types'

/**
 * Generic public/preview renderer for CMS pages that are NOT the homepage
 * (whose sections render through bespoke React components — hero,
 * trustStrip, ceoSection, etc. — see app/page.tsx). Only a minimal, safe
 * subset of `cms_block_definitions` keys have a defined config shape and a
 * renderer here; every other block type is skipped rather than guessed at,
 * since `config` is arbitrary structured JSON with no fixed schema
 * (master-prompt §8.7: never render it as raw HTML).
 */

type RichTextConfig = { title?: string; body: string }
type ImageConfig = { src: string; alt?: string; caption?: string }
type CtaConfig = { title?: string; description?: string; buttonLabel?: string; buttonHref?: string }

function RichTextBlock({ config }: { config: RichTextConfig }) {
  const paragraphs = (config.body ?? '').split(/\n{2,}/).filter(Boolean)
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-base leading-relaxed text-foreground/80">
      {config.title && <h2 className="font-display text-2xl font-bold text-foreground">{config.title}</h2>}
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  )
}

function ImageBlock({ config }: { config: ImageConfig }) {
  if (!config.src) return null
  return (
    <figure className="mx-auto max-w-3xl">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
        <Image src={config.src} alt={config.alt ?? ''} fill sizes="100vw" className="object-cover" />
      </div>
      {config.caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{config.caption}</figcaption>}
    </figure>
  )
}

function CtaBlock({ config }: { config: CtaConfig }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-secondary/40 p-8 text-center">
      {config.title && <h3 className="font-display text-xl font-bold text-foreground">{config.title}</h3>}
      {config.description && <p className="mt-2 text-sm text-muted-foreground">{config.description}</p>}
      {config.buttonLabel && config.buttonHref && (
        <MVButton href={config.buttonHref} className="mt-5">
          {config.buttonLabel}
        </MVButton>
      )}
    </div>
  )
}

const RENDERERS: Record<string, (block: CmsBlock) => React.ReactNode> = {
  RICH_TEXT: (block) => <RichTextBlock config={block.config as RichTextConfig} />,
  IMAGE: (block) => <ImageBlock config={block.config as ImageConfig} />,
  CTA: (block) => <CtaBlock config={block.config as CtaConfig} />,
}

export function CmsGenericPageRenderer({
  sections,
  blockDefinitionKeyById,
}: {
  sections: (CmsSection & { blocks: CmsBlock[] })[]
  blockDefinitionKeyById: Map<string, string>
}) {
  return (
    <div className="space-y-12 py-12">
      {sections.map((section) => (
        <section key={section.id} className="container-mv space-y-8">
          {section.blocks.map((block) => {
            const key = blockDefinitionKeyById.get(block.blockDefinitionId)
            const renderer = key ? RENDERERS[key] : undefined
            return renderer ? <div key={block.id}>{renderer(block)}</div> : null
          })}
        </section>
      ))}
    </div>
  )
}

import { z } from 'zod'

/**
 * Runtime validation for /combo content, mirroring `lib/flight/flight-schema.ts`'s
 * boundary rule: content is treated as untrusted input, not a trusted
 * internal constant, even while it's still sourced from a local seed file.
 */

const cmsImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
})

const comboStatusSchema = z.enum(['draft', 'published', 'archived'])

const comboCtaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
})

const comboItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  thumbnail: cmsImageSchema,
  summary: z.string().min(1),
  content: z.string().optional(),
  destination: z.string().min(1),
  category: z.string().min(1),
  priceFrom: z.number().nonnegative(),
  currency: z.literal('VND'),
  cta: comboCtaSchema,
  highlights: z.array(z.string().min(1)).min(2).max(4),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  status: comboStatusSchema,
  order: z.number(),
})

const comboCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  image: cmsImageSchema,
  href: z.string().min(1),
  order: z.number(),
  status: comboStatusSchema,
})

const comboDestinationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  stat: z.string().min(1),
  image: cmsImageSchema,
  href: z.string().min(1),
  order: z.number(),
  status: comboStatusSchema,
})

const comboWhyItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  image: cmsImageSchema,
})

const comboArticleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  image: cmsImageSchema,
  publishedAt: z.string().min(1),
  href: z.string().min(1),
  order: z.number(),
  isActive: z.boolean(),
})

export const comboLandingContentSchema = z.object({
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    canonicalPath: z.string().min(1),
    ogImage: z.string().min(1),
  }),
  hero: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    heroImage: cmsImageSchema,
    heroVideo: z.string().optional(),
    primaryCta: comboCtaSchema,
    secondaryCta: comboCtaSchema,
    trustSignals: z.array(z.string().min(1)).min(1),
  }),
  combos: z.array(comboItemSchema).min(6),
  categories: z.array(comboCategorySchema).min(1),
  destinationExplorer: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    destinations: z.array(comboDestinationSchema),
  }),
  whyCombo: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(comboWhyItemSchema).min(1),
  }),
  articles: z.array(comboArticleSchema).min(1),
  finalCta: z.object({
    headline: z.string().min(1),
    description: z.string().min(1),
    primaryCta: comboCtaSchema,
  }),
})

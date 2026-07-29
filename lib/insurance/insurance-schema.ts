import { z } from 'zod'

/**
 * Runtime validation for /insurance content, mirroring
 * `lib/combo/combo-schema.ts`'s boundary rule: content is treated as
 * untrusted input, not a trusted internal constant, even while it's
 * still sourced from a local seed file.
 */

const cmsImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
})

const ctaSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
})

const insuranceMoneySchema = z.object({
  usd: z.number().nonnegative(),
  vnd: z.number().nonnegative(),
})

const insuranceZoneSchema = z.enum(['SOUTHEAST_ASIA', 'ASIA_AUS_NZ', 'GLOBAL'])
const insurancePlanCodeSchema = z.enum(['A', 'B', 'C'])

const premiumRateSchema = z.object({
  zone: insuranceZoneSchema,
  plan: insurancePlanCodeSchema,
  minDays: z.number().int().positive(),
  maxDays: z.number().int().positive(),
  rate: insuranceMoneySchema,
})

const ZONE_COUNT = 3
const PLAN_COUNT = 3
const DURATION_BAND_COUNT = 26
const EXPECTED_PREMIUM_ROW_COUNT = ZONE_COUNT * PLAN_COUNT * DURATION_BAND_COUNT

/**
 * `.length(234)` alone would pass even if the transcription duplicated
 * one (zone,plan,band) triple and dropped another — the refine step below
 * catches that: every triple must appear exactly once.
 */
export const premiumRatesSchema = z
  .array(premiumRateSchema)
  .length(EXPECTED_PREMIUM_ROW_COUNT)
  .refine(
    (rates) => {
      const seen = new Set<string>()
      for (const rate of rates) {
        const key = `${rate.zone}|${rate.plan}|${rate.minDays}-${rate.maxDays}`
        if (seen.has(key)) return false
        seen.add(key)
      }
      return seen.size === EXPECTED_PREMIUM_ROW_COUNT
    },
    { message: `Premium table must have exactly one row per (zone, plan, duration band) — expected ${EXPECTED_PREMIUM_ROW_COUNT} unique triples` },
  )

const benefitLimitValueSchema = z.union([
  z.object({ kind: z.literal('amount'), value: insuranceMoneySchema }),
  z.object({ kind: z.literal('included') }),
  z.object({ kind: z.literal('not_applicable') }),
])

const benefitRowSchema = z.object({
  code: z.string().min(1),
  parentCode: z.string().optional(),
  category: z.string().min(1),
  label: z.string().min(1),
  limits: z.object({ A: benefitLimitValueSchema, B: benefitLimitValueSchema, C: benefitLimitValueSchema }),
})

const insurancePlanSummarySchema = z.object({
  code: insurancePlanCodeSchema,
  name: z.string().min(1),
  tagline: z.string().min(1),
  recommendedFor: z.string().optional(),
  isFeatured: z.boolean().optional(),
})

const insuranceHeroSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  heroImage: cmsImageSchema,
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  trustSignals: z.array(z.string().min(1)).min(1),
})

const insuranceWhyBuyItemSchema = z.object({
  id: z.string().min(1),
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
})

const insuranceFaqItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  order: z.number(),
  isActive: z.boolean(),
})

const insuranceArticleTeaserSchema = z.object({
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

export const insuranceArticleSchema = insuranceArticleTeaserSchema.extend({
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  body: z.array(z.string().min(1)).min(1),
})

export const insuranceLandingContentSchema = z.object({
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    canonicalPath: z.string().min(1),
    ogImage: z.string().min(1),
  }),
  hero: insuranceHeroSchema,
  whyBuy: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(insuranceWhyBuyItemSchema).min(1),
  }),
  eligibility: z.object({
    minAgeWeeks: z.number().positive(),
    maxAgeYears: z.number().positive(),
    maxTripDays: z.number().positive(),
    notes: z.array(z.string().min(1)).min(1),
  }),
  plans: z.array(insurancePlanSummarySchema).length(PLAN_COUNT),
  benefitRows: z.array(benefitRowSchema).min(DURATION_BAND_COUNT),
  premiumRates: premiumRatesSchema,
  faqs: z.array(insuranceFaqItemSchema).min(1),
  finalCta: z.object({
    headline: z.string().min(1),
    description: z.string().min(1),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
  }),
  provider: z.object({
    name: z.string().min(1),
    hotline: z.string().min(1),
    website: z.string().min(1),
    legalBasis: z.string().min(1),
  }),
})

import type { CmsImage } from '@/types/cms'
import type { FlightArticle } from '@/types/flight'

/**
 * CMS-ready content contract for /insurance (Bảo hiểm Du lịch — DBV
 * partnership landing page). Deliberately an editorial lead-gen landing
 * page, not a booking/checkout engine — no order, policy, or payment
 * fields. `lib/insurance/insurance-content-seed.ts` (plus the two rate/
 * benefit table seeds) is the only thing a real CMS integration needs to
 * replace; every section component depends only on the types below.
 */

export type InsuranceZone = 'SOUTHEAST_ASIA' | 'ASIA_AUS_NZ' | 'GLOBAL'
export type InsurancePlanCode = 'A' | 'B' | 'C'

export interface InsuranceMoney {
  usd: number
  vnd: number
}

/**
 * One row of the 26-band rate card, per zone × plan — transcribed
 * verbatim from docs/insurance/Tờ rơi du lịch quốc tế DBV.pdf (pages 5–6).
 * The full seeded set is exactly 3 zones × 3 plans × 26 bands = 234 rows,
 * enforced by `insurance-schema.ts`.
 */
export interface PremiumRate {
  zone: InsuranceZone
  plan: InsurancePlanCode
  minDays: number
  maxDays: number
  rate: InsuranceMoney
}

/**
 * Discriminated union — 3 benefit rows in the source PDF (24/7 medical
 * assistance, 24h travel assistance, Global Saving Service) have no
 * numeric cap ("Bao gồm/Included"), so `amount` must not be forced to 0
 * for them. The golf-related rows (21, 21.1, 21.2, and the golf-equipment
 * sub-limit under 18.1) are marked "N/A" for Plan A in the source PDF —
 * Plan A genuinely does not offer that benefit, so `not_applicable` is
 * kept distinct from `included`/`amount` rather than faked as a 0 limit.
 */
export type BenefitLimitValue = { kind: 'amount'; value: InsuranceMoney } | { kind: 'included' } | { kind: 'not_applicable' }

/**
 * One row of the benefit table (PDF pages 3–4). `code` matches the
 * source's own numbering ('1', '1.1', '3.2', '15.1', ...) so the seed can
 * be diffed against the PDF directly; `parentCode` links a lettered
 * sub-row (e.g. '1.1') to its parent ('1') for indentation in the compare
 * table.
 */
export interface BenefitRow {
  code: string
  parentCode?: string
  category: string
  label: string
  limits: Record<InsurancePlanCode, BenefitLimitValue>
}

export interface InsurancePlanSummary {
  code: InsurancePlanCode
  name: string
  tagline: string
  recommendedFor?: string
  isFeatured?: boolean
}

export interface InsuranceHeroContent {
  eyebrow?: string
  headline: string
  subheadline: string
  /** Real destination photo used as a temporary placeholder — see insurance-hero.tsx's isTemporaryAsset note. Not a hospital/accident image (brand rule). */
  heroImage: CmsImage
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  trustSignals: string[]
}

export interface InsuranceWhyBuyItem {
  id: string
  icon: string
  title: string
  description: string
}

export interface InsuranceFaqItem {
  id: string
  question: string
  answer: string
  order: number
  isActive: boolean
}

/**
 * Structurally identical to `FlightArticle` on purpose — lets the
 * landing page's teaser rail reuse `FlightArticleCard`
 * (`components/flight/flight-article-card.tsx`) with zero adapter, same
 * reuse Combo already established for its own article rail.
 */
export type InsuranceArticleTeaser = FlightArticle

/** Full article, served by /insurance/kien-thuc/[slug]. */
export interface InsuranceArticle extends InsuranceArticleTeaser {
  metaTitle: string
  metaDescription: string
  /** One paragraph per entry — kept as plain strings (no MDX pipeline) since this is 6–8 static, editorially-authored posts, not a general blog engine. */
  body: string[]
}

/**
 * Deliberately does NOT include an `articles` field — teasers are derived
 * from `InsuranceArticle[]` (`getInsuranceArticles()` in
 * insurance-repository.ts), not hand-duplicated here, so an article's
 * title/excerpt/image can never drift between its teaser and its own
 * detail page.
 */
export interface InsuranceLandingContent {
  seo: {
    title: string
    description: string
    canonicalPath: string
    ogImage: string
  }
  hero: InsuranceHeroContent
  whyBuy: {
    eyebrow: string
    title: string
    description: string
    items: InsuranceWhyBuyItem[]
  }
  eligibility: {
    minAgeWeeks: number
    maxAgeYears: number
    maxTripDays: number
    notes: string[]
  }
  plans: InsurancePlanSummary[]
  benefitRows: BenefitRow[]
  premiumRates: PremiumRate[]
  faqs: InsuranceFaqItem[]
  finalCta: {
    headline: string
    description: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
  }
  provider: {
    name: string
    hotline: string
    website: string
    legalBasis: string
  }
}

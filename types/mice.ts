import type { CmsImage, VerifiedStat } from '@/types/cms'

/**
 * CMS-ready content contract for /mice (Volume of work: "SEO + Conversion
 * MICE Landing Page", brief §XVIII). Every entity below carries the same
 * baseline editorial fields so a real CMS collection could model each one
 * as its own content type without redesigning the shape later — the
 * mock repository in `lib/mice/mice-data.ts` is the only thing a CMS
 * migration needs to replace (mirrors `lib/cms/client.ts`'s seam for the
 * homepage).
 *
 * Fields kept on every entity even where a given instance barely uses
 * them (e.g. `MiceObjective`, which is a small icon tile, still carries
 * `seoTitle`/`metaDescription`/`ogImage`) — per brief §XVIII these are
 * the minimum contract, not a per-entity minimum; an entity that never
 * becomes its own page just leaves those fields unused.
 */
export interface MiceContentEntity {
  id: string
  slug: string
  title: string
  subtitle?: string
  excerpt?: string
  content?: string
  coverImage?: string
  coverImageAlt?: string
  gallery?: CmsImage[]
  category?: string
  order: number
  isActive: boolean
  locale: string
  seoTitle?: string
  metaDescription?: string
  ogImage?: string
  createdAt: string
  updatedAt: string
}

export type MiceSolutionType = 'meeting' | 'incentive' | 'conference' | 'event'

/** One of the 4 MICE solution groups (Meeting / Incentive / Conference / Event). */
export interface MiceSolution extends MiceContentEntity {
  type: MiceSolutionType
  /** English acronym term, e.g. "Meeting". */
  termEn: string
  /** Displayed Vietnamese name, e.g. "Hội họp và kết nối công việc". */
  displayName: string
  objective: string
  audienceFit: string
  applications: string[]
  typicalComponents: string[]
  ctaLabel: string
}

/** One business objective a company might come to Minh Việt with (§VII). */
export interface MiceObjective extends MiceContentEntity {
  description: string
  /** Route/anchor to the related solution, if one already exists. */
  relatedHref?: string
}

/** One illustrative program idea/sample itinerary (§XII). */
export interface MiceProgramIdea extends MiceContentEntity {
  programType: string
  objective: string
  durationLabel: string
  keyComponents: string[]
}

/** Anonymized-by-default project story (§XIII). */
export interface MiceCaseStudy extends MiceContentEntity {
  /** True only once a named client has cleared publication. */
  isAnonymized: boolean
  industry: string
  groupSize: string
  objective: string
  solution: string
  componentsDelivered: string[]
  /** Left undefined until a real, verified outcome can be cited — never fabricated. */
  result?: string
  disclaimer: string
}

export interface MiceFAQ extends MiceContentEntity {
  question: string
  /** Plain-text answer — schema-ready for a future FAQPage JSON-LD block (not wired yet, see output doc). */
  answer: string
}

export type MiceMediaKind = 'video' | 'photo'

/** One video/gallery entry for the "Cảm xúc sau mỗi chương trình" section (§XIV). */
export interface MiceMediaItem extends MiceContentEntity {
  kind: MiceMediaKind
  /** Left undefined when no real footage exists yet — the section must render a "coming soon" state, never an unrelated stock video. */
  videoSrc?: string
}

/** Value-cluster grouping for the "customizable components" section (§XI). */
export interface MiceComponentGroup {
  id: string
  label: string
  items: string[]
}

/** One benefit entry inside a benefit category (§IX). */
export interface MiceBenefit {
  id: string
  label: string
}

export interface MiceBenefitCategory {
  id: string
  title: string
  benefits: MiceBenefit[]
}

/** One step of the 6-step process (§X). */
export interface MiceProcessStep {
  id: string
  order: number
  title: string
  description: string
  outputs: string[]
}

/**
 * Root aggregate the page fetches in one call — mirrors `HomepageContent`
 * in `types/homepage.ts`. `verifiedStats` intentionally excludes the
 * unverified "300+ chương trình MICE" figure already used elsewhere in
 * the app; see output doc §"Remaining backend/CMS tasks" for why.
 */
export interface MiceLandingContent {
  seo: {
    title: string
    description: string
    canonicalPath: string
    ogImage: string
  }
  hero: {
    eyebrow: string
    headline: string
    supportingCopy: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    image: CmsImage
  }
  objectives: MiceObjective[]
  solutions: MiceSolution[]
  benefitCategories: MiceBenefitCategory[]
  process: MiceProcessStep[]
  componentGroups: MiceComponentGroup[]
  programIdeas: MiceProgramIdea[]
  caseStudies: MiceCaseStudy[]
  mediaItems: MiceMediaItem[]
  verifiedStats: VerifiedStat[]
  capabilityPoints: { id: string; title: string; description: string }[]
  faqs: MiceFAQ[]
  finalCta: {
    headline: string
    description: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
  }
}

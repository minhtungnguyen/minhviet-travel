import type { CmsImage } from '@/types/cms'
import type { FlightArticle } from '@/types/flight'

/**
 * CMS-ready content contract for /combo (EPIC-006 — Combo Landing Page).
 * Deliberately flat and lightweight per the brief: this is an editorial
 * commerce landing page, not a booking engine — no inventory, room type,
 * availability, or dynamic pricing fields. `lib/combo/combo-data-seed.ts`
 * is the only thing a real CMS integration needs to replace; every
 * section component depends only on the types below.
 */

export type ComboStatus = 'draft' | 'published' | 'archived'

/**
 * One bundled travel package shown as a card (Section 01 "Combo nổi bật"
 * and the /combo/tat-ca full listing — both reuse the same `ComboCard`
 * component and this same type). `content`/`ogImage` are reserved for a
 * future combo detail page; nothing in this epic renders them.
 */
export interface ComboItem {
  id: string
  slug: string
  title: string
  thumbnail: CmsImage
  summary: string
  content?: string
  /** Display label only (e.g. "Hạ Long") — not a foreign key into destinationExplorer. */
  destination: string
  /** Matches a `ComboCategory.id`. */
  category: string
  priceFrom: number
  currency: 'VND'
  cta: { label: string; href: string }
  /** 2–4 short inclusion bullets (e.g. "Vé máy bay khứ hồi") — plain marketing copy, not a structured inventory/room-type field. */
  highlights: string[]
  seoTitle?: string
  metaDescription?: string
  ogImage?: string
  status: ComboStatus
  order: number
}

/** One visual category tile in "Chọn theo nhu cầu" (Section 02). */
export interface ComboCategory {
  id: string
  label: string
  description: string
  image: CmsImage
  href: string
  order: number
  status: ComboStatus
}

/**
 * One destination in the Destination Explorer (Section 03). `status`
 * is the mechanism that keeps this data-driven and asset-gated: only
 * `'published'` entries render, so a destination with no real
 * brand-quality photography yet simply isn't added here — it appears
 * automatically once it is, with no component change required.
 */
export interface ComboDestination {
  id: string
  slug: string
  name: string
  tagline: string
  /** Short display stat, e.g. "3 hành trình Combo" — text only, not a live inventory count. */
  stat: string
  image: CmsImage
  href: string
  order: number
  status: ComboStatus
}

/** One editorial image+headline+description block in "Vì sao nên chọn Combo" (Section 04). */
export interface ComboWhyItem {
  id: string
  title: string
  description: string
  image: CmsImage
}

export interface ComboLandingContent {
  seo: {
    title: string
    description: string
    canonicalPath: string
    ogImage: string
  }
  hero: {
    eyebrow?: string
    headline: string
    subheadline: string
    /** Always-required fallback — rendered when video is unavailable, fails, or motion is reduced. */
    heroImage: CmsImage
    heroVideo?: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    /** Short trust pills rendered under the CTAs (e.g. "Giá trọn gói minh bạch") — text only, no invented counters. */
    trustSignals: string[]
  }
  combos: ComboItem[]
  categories: ComboCategory[]
  destinationExplorer: {
    eyebrow: string
    title: string
    description: string
    destinations: ComboDestination[]
  }
  whyCombo: {
    eyebrow: string
    title: string
    description: string
    items: ComboWhyItem[]
  }
  /**
   * Section 05 "Bài viết mới" deliberately reuses `FlightArticleCard`
   * (`components/flight/flight-article-card.tsx`) instead of a new card
   * component — per brief "Reuse News Component, không tạo Component
   * mới." Typing this as the same `FlightArticle` shape (rather than a
   * duplicated `ComboArticle`) is what makes that reuse a zero-adapter
   * drop-in.
   */
  articles: FlightArticle[]
  finalCta: {
    headline: string
    description: string
    primaryCta: { label: string; href: string }
  }
}

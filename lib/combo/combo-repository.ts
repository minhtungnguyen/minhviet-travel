import 'server-only'
import { cache } from 'react'
import { comboLandingContentSeed } from '@/lib/combo/combo-data-seed'
import { comboLandingContentSchema } from '@/lib/combo/combo-schema'
import type { ComboItem, ComboLandingContent } from '@/types/combo'

/**
 * The single seam a real CMS integration needs to replace — mirrors
 * `lib/flight/flight-repository.ts`. Every /combo and /combo/tat-ca
 * component calls this and depends only on `ComboLandingContent`, never
 * the raw seed file.
 */
export const getComboLandingContent = cache(async (): Promise<ComboLandingContent> => {
  const raw: unknown = comboLandingContentSeed
  return comboLandingContentSchema.parse(raw)
})

function bySortOrder<T extends { order: number }>(a: T, b: T) {
  return a.order - b.order
}

export function getPublishedCombos(content: ComboLandingContent): ComboItem[] {
  return content.combos.filter((combo) => combo.status === 'published').sort(bySortOrder)
}

export function getPublishedCategories(content: ComboLandingContent) {
  return content.categories.filter((category) => category.status === 'published').sort(bySortOrder)
}

/**
 * Only 'published' destinations render — this is the entire mechanism
 * behind "hide until real brand-quality assets exist" (EPIC-006 brief).
 * No hardcoded destination list anywhere in the app; adding a new
 * `status: 'published'` entry to the seed/CMS is the only thing needed
 * for a destination to appear here.
 */
export function getPublishedDestinations(content: ComboLandingContent) {
  return content.destinationExplorer.destinations
    .filter((destination) => destination.status === 'published')
    .sort(bySortOrder)
}

export interface ComboListFilter {
  category?: string
  destination?: string
}

/** Shared by /combo/tat-ca — plain equality filtering, no new state architecture. */
export function filterCombos(combos: ComboItem[], filter: ComboListFilter): ComboItem[] {
  return combos.filter((combo) => {
    if (filter.category && combo.category !== filter.category) return false
    if (filter.destination && combo.destination !== filter.destination) return false
    return true
  })
}

export const COMBO_LIST_PAGE_SIZE = 12

export function paginateCombos(combos: ComboItem[], page: number) {
  const totalPages = Math.max(1, Math.ceil(combos.length / COMBO_LIST_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * COMBO_LIST_PAGE_SIZE
  return {
    items: combos.slice(start, start + COMBO_LIST_PAGE_SIZE),
    page: safePage,
    totalPages,
    totalItems: combos.length,
  }
}

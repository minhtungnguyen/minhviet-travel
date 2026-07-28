import { describe, expect, it } from 'vitest'
import { hasAnyMatch, searchAttractionCatalog, type AttractionSearchCatalog } from '@/lib/attraction-ticket/search-attraction-catalog'

const CATALOG: AttractionSearchCatalog = {
  products: [
    {
      slug: 've-cap-treo-nu-hoang-ha-long',
      destinationSlug: 'ha-long',
      title: 'Vé Cáp Treo Nữ Hoàng — Sun World Hạ Long',
      venueName: 'Sun World Ha Long Complex',
      destinationName: 'Hạ Long',
      imageUrl: '/images/x.jpg',
      priceFrom: 350_000,
      experienceTag: 'Cáp treo',
    },
    {
      slug: 've-vui-choi-vinpearl-cat-ba',
      destinationSlug: 'cat-ba',
      title: 'Vé vui chơi Vinpearl Cát Bà',
      venueName: 'Vinpearl Cát Bà',
      destinationName: 'Cát Bà',
      imageUrl: '/images/y.jpg',
      priceFrom: 400_000,
      experienceTag: 'Gia đình & Trẻ em',
    },
  ],
  venues: [
    { slug: 'sun-world-ha-long', name: 'Sun World Ha Long Complex', destinationSlug: 'ha-long', productCount: 3 },
    { slug: 'vinpearl-cat-ba', name: 'Vinpearl Cát Bà', destinationSlug: 'cat-ba', productCount: 2 },
  ],
  destinations: [
    { slug: 'ha-long', name: 'Hạ Long' },
    { slug: 'cat-ba', name: 'Cát Bà' },
  ],
  categories: [
    { slug: 'cap-treo', name: 'Cáp treo' },
    { slug: 'gia-dinh-tre-em', name: 'Gia đình & Trẻ em' },
  ],
}

describe('searchAttractionCatalog', () => {
  it('returns nothing for an empty query', () => {
    const result = searchAttractionCatalog(CATALOG, '')
    expect(hasAnyMatch(result)).toBe(false)
  })

  it('returns nothing for a whitespace-only query', () => {
    const result = searchAttractionCatalog(CATALOG, '   ')
    expect(hasAnyMatch(result)).toBe(false)
  })

  it('matches product title', () => {
    const result = searchAttractionCatalog(CATALOG, 'cáp treo nữ hoàng')
    expect(result.products.map((p) => p.slug)).toEqual(['ve-cap-treo-nu-hoang-ha-long'])
  })

  it('is diacritic-insensitive (typing without dấu matches dấu content)', () => {
    const result = searchAttractionCatalog(CATALOG, 'ha long')
    expect(result.products.map((p) => p.slug)).toContain('ve-cap-treo-nu-hoang-ha-long')
    expect(result.destinations.map((d) => d.slug)).toEqual(['ha-long'])
    expect(result.venues.map((v) => v.slug)).toEqual(['sun-world-ha-long'])
  })

  it('is case-insensitive', () => {
    const result = searchAttractionCatalog(CATALOG, 'VINPEARL')
    expect(result.venues.map((v) => v.slug)).toEqual(['vinpearl-cat-ba'])
    expect(result.products.map((p) => p.slug)).toEqual(['ve-vui-choi-vinpearl-cat-ba'])
  })

  it('matches venue ("brand") name', () => {
    const result = searchAttractionCatalog(CATALOG, 'sun world')
    expect(result.venues.map((v) => v.slug)).toEqual(['sun-world-ha-long'])
  })

  it('matches destination name', () => {
    const result = searchAttractionCatalog(CATALOG, 'cat ba')
    expect(result.destinations.map((d) => d.slug)).toEqual(['cat-ba'])
  })

  it('matches category name and pulls in tagged products via experienceTag', () => {
    const result = searchAttractionCatalog(CATALOG, 'cáp treo')
    expect(result.categories.map((c) => c.slug)).toEqual(['cap-treo'])
    expect(result.products.map((p) => p.slug)).toEqual(['ve-cap-treo-nu-hoang-ha-long'])
  })

  it('returns no matches for a nonsense query (honest no-result, not fabricated results)', () => {
    const result = searchAttractionCatalog(CATALOG, 'xyzzy-does-not-exist')
    expect(hasAnyMatch(result)).toBe(false)
  })
})

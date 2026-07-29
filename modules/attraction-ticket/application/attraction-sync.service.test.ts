import { describe, expect, it, vi } from 'vitest'
import type { ActorContext } from '@/shared/auth/guards'
import { AttractionSyncService } from '@/modules/attraction-ticket/application/attraction-sync.service'
import { MockAttractionTicketProvider } from '@/integrations/attraction-ticket/providers/mock-provider'
import type { AttractionTicketRepository } from '@/modules/attraction-ticket/infrastructure/attraction-ticket.repository'
import type { AttractionProduct, AttractionProviderRef, AttractionSyncLog } from '@/modules/attraction-ticket/domain/types'

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    roles: ['OPERATION'],
    permissions: new Set(['attraction_ticket.sync.trigger', 'attraction_ticket.sync.read']),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

const PRODUCT: AttractionProduct = {
  id: '00000000-0000-0000-0000-000000000001',
  websiteId: 'site-1',
  attractionVenueId: 'venue-1',
  productTypeId: 'product-type-1',
  slug: 've-vinwonders-1-ngay',
  imageUrl: '/images/combo/ha-long-sunset.jpg',
  imageAlt: 'Test venue image',
  galleryImages: [],
  priceFrom: 890_000,
  currency: 'VND',
  isFeatured: false,
  sortOrder: 0,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
}

function makeFakeRepository(overrides: Partial<AttractionTicketRepository> = {}): AttractionTicketRepository {
  const notUsed = async () => {
    throw new Error('not used in this test')
  }
  const syncLogs: AttractionSyncLog[] = []
  const providerRefs = new Map<string, AttractionProviderRef>()

  return {
    findVenueById: notUsed,
    findVenueBySlug: notUsed,
    listVenues: notUsed,
    createVenue: notUsed,
    updateVenue: notUsed,
    softDeleteVenue: notUsed,
    listVenueTranslations: notUsed,
    listVenueTranslationsForVenues: notUsed,
    upsertVenueTranslation: notUsed,

    findProductById: async (id) => (id === PRODUCT.id ? PRODUCT : null),
    findProductBySlug: notUsed,
    listProducts: notUsed,
    createProduct: notUsed,
    updateProduct: notUsed,
    softDeleteProduct: notUsed,
    listProductTranslations: notUsed,
    listProductTranslationsForProducts: notUsed,
    upsertProductTranslation: notUsed,
    listFaqs: notUsed,
    listCrossSells: notUsed,
    listCategories: notUsed,
    listCategoryTranslationsForCategories: notUsed,
    listProductIdsForCategory: notUsed,
    listCategoryLinksForProducts: notUsed,

    findProviderRefByVenue: notUsed,
    findProviderRefByProduct: async (productId) => providerRefs.get(productId) ?? null,
    upsertProviderRefForVenue: notUsed,
    upsertProviderRefForProduct: async (productId, input) => {
      const ref: AttractionProviderRef = {
        id: `ref-${productId}`,
        attractionVenueId: null,
        attractionProductId: productId,
        providerCode: input.providerCode,
        providerVenueId: input.providerVenueId ?? null,
        providerProductId: input.providerProductId ?? null,
        providerVariantId: input.providerVariantId ?? null,
        lastSyncedAt: new Date().toISOString(),
      }
      providerRefs.set(productId, ref)
      return ref
    },

    findOrderById: notUsed,
    findOrderByIdempotencyKey: notUsed,
    findOrderByCodeForCustomer: notUsed,
    createOrder: notUsed,
    updateOrderStatus: notUsed,
    listOrderItems: notUsed,
    createVoucher: notUsed,
    listVouchers: notUsed,

    createSyncLog: async (input) => {
      const log: AttractionSyncLog = {
        id: `log-${syncLogs.length + 1}`,
        syncType: input.syncType,
        status: input.status,
        attractionVenueId: input.attractionVenueId ?? null,
        attractionProductId: input.attractionProductId ?? null,
        errorMessage: input.errorMessage ?? null,
        triggeredBy: input.triggeredBy ?? null,
        createdAt: new Date().toISOString(),
      }
      syncLogs.push(log)
      return log
    },
    createApiErrorLog: notUsed,

    ...overrides,
  }
}

const noopAuditLogger = vi.fn(async () => {})

describe('AttractionSyncService.syncProducts', () => {
  it('skips provider mappings whose internalProductId has no matching local product', async () => {
    const repository = makeFakeRepository({ findProductById: async () => null })
    const service = new AttractionSyncService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const result = await service.syncProducts(makeActor(), 'req-1')
    expect(result.matched).toBe(0)
    expect(result.total).toBeGreaterThan(0)
    expect(result.syncLog.status).toBe('SUCCESS')
  })

  it('denies syncing for an actor lacking attraction_ticket.sync.trigger', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionSyncService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const actor = makeActor({ permissions: new Set(['attraction_ticket.sync.read']) })
    await expect(service.syncProducts(actor, 'req-1')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

describe('AttractionSyncService.syncVariantsForProduct', () => {
  it('requires the product to already have a provider ref (syncProducts run first)', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionSyncService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    await expect(service.syncVariantsForProduct(makeActor(), PRODUCT.id, 'req-1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('applies the first returned variant mapping onto the existing provider ref', async () => {
    const repository = makeFakeRepository()
    await repository.upsertProviderRefForProduct(PRODUCT.id, { providerCode: 'ONEINVENTORY', providerProductId: 'mock-product-1' })
    const service = new AttractionSyncService(repository, noopAuditLogger, new MockAttractionTicketProvider())

    const result = await service.syncVariantsForProduct(makeActor(), PRODUCT.id, 'req-1')
    expect(result.variantCount).toBeGreaterThan(0)
    expect(result.providerRef.providerVariantId).toBeTruthy()
  })
})

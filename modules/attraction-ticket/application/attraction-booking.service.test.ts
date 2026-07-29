import { describe, expect, it, vi } from 'vitest'
import type { ActorContext } from '@/shared/auth/guards'
import { AttractionBookingService } from '@/modules/attraction-ticket/application/attraction-booking.service'
import { MockAttractionTicketProvider } from '@/integrations/attraction-ticket/providers/mock-provider'
import type {
  AttractionTicketRepository,
  AttractionOrderInsert,
  AttractionOrderItemInsert,
  AttractionOrderStatusPatch,
} from '@/modules/attraction-ticket/infrastructure/attraction-ticket.repository'
import type { AttractionOrder, AttractionOrderItem, AttractionOrderStatus, AttractionProduct, AttractionVoucher } from '@/modules/attraction-ticket/domain/types'
import type { AttractionCheckoutCreateInput } from '@/modules/attraction-ticket/schemas/attraction-ticket.schema'

function makeActor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    roles: ['BOOKING'],
    permissions: new Set(['attraction_ticket.booking.read', 'attraction_ticket.booking.cancel']),
    websiteIds: [],
    accountStatus: 'ACTIVE',
    ...overrides,
  }
}

const PRODUCT: AttractionProduct = {
  id: 'product-1',
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

/** Minimal in-memory fake covering only what AttractionBookingService actually calls — everything else throws if hit, so a test that exercises an unexpected path fails loudly instead of silently. */
function makeFakeRepository(overrides: Partial<AttractionTicketRepository> = {}): AttractionTicketRepository {
  const notUsed = async () => {
    throw new Error('not used in this test')
  }
  const orders = new Map<string, AttractionOrder>()
  const itemsByOrder = new Map<string, AttractionOrderItem[]>()
  const vouchersByOrder = new Map<string, AttractionVoucher[]>()
  let seq = 0

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
    findProviderRefByProduct: notUsed,
    upsertProviderRefForVenue: notUsed,
    upsertProviderRefForProduct: notUsed,

    findOrderById: async (id) => orders.get(id) ?? null,
    findOrderByIdempotencyKey: async (key) => [...orders.values()].find((o) => o.idempotencyKey === key) ?? null,
    findOrderByCodeForCustomer: async (orderCode, email) =>
      [...orders.values()].find((o) => o.orderCode === orderCode && o.customerEmail.toLowerCase() === email.toLowerCase()) ?? null,
    createOrder: async (order: AttractionOrderInsert, items: AttractionOrderItemInsert[]) => {
      seq += 1
      const id = `order-${seq}`
      const row: AttractionOrder = {
        id,
        websiteId: order.websiteId,
        orderCode: order.orderCode,
        idempotencyKey: order.idempotencyKey,
        providerCode: order.providerCode,
        providerOrderId: null,
        status: 'INITIATED',
        paymentStatus: null,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        note: order.note ?? null,
        currency: 'VND',
        totalAmount: order.totalAmount,
        createdBy: order.createdBy ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      orders.set(id, row)
      const itemRows: AttractionOrderItem[] = items.map((item, index) => ({
        id: `item-${id}-${index}`,
        attractionOrderId: id,
        attractionProductId: item.attractionProductId,
        providerVariantId: item.providerVariantId,
        usageDate: item.usageDate,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        ticketHolderName: item.ticketHolderName ?? null,
      }))
      itemsByOrder.set(id, itemRows)
      return { order: row, items: itemRows }
    },
    updateOrderStatus: async (id: string, status: AttractionOrderStatus, patch: AttractionOrderStatusPatch = {}) => {
      const existing = orders.get(id)
      if (!existing) throw new Error(`unknown order ${id}`)
      const updated: AttractionOrder = {
        ...existing,
        status,
        ...(patch.providerOrderId !== undefined && { providerOrderId: patch.providerOrderId }),
        ...(patch.paymentStatus !== undefined && { paymentStatus: patch.paymentStatus }),
      }
      orders.set(id, updated)
      return updated
    },
    listOrderItems: async (orderId) => itemsByOrder.get(orderId) ?? [],
    createVoucher: async (orderId, voucher) => {
      const row: AttractionVoucher = {
        id: `voucher-${orderId}`,
        attractionOrderId: orderId,
        providerVoucherId: voucher.providerVoucherId,
        downloadUrl: voucher.downloadUrl ?? null,
        hashCode: voucher.hashCode ?? null,
        issuedAt: voucher.issuedAt ?? null,
      }
      vouchersByOrder.set(orderId, [...(vouchersByOrder.get(orderId) ?? []), row])
      return row
    },
    listVouchers: async (orderId) => vouchersByOrder.get(orderId) ?? [],

    createSyncLog: notUsed,
    createApiErrorLog: notUsed,

    ...overrides,
  }
}

const noopAuditLogger = vi.fn(async () => {})

const baseInput = (overrides: Partial<AttractionCheckoutCreateInput> = {}): AttractionCheckoutCreateInput => ({
  websiteId: 'site-1',
  idempotencyKey: '11111111-1111-1111-1111-111111111111',
  items: [{ attractionProductId: PRODUCT.id, providerVariantId: 'mock-variant-adult', usageDate: '2026-08-01', quantity: 2 }],
  customerName: 'Nguyễn Văn A',
  customerPhone: '0900000000',
  customerEmail: 'a@example.com',
  ...overrides,
})

describe('AttractionBookingService.createBooking', () => {
  it('creates a booking, confirms it, and issues a voucher via the mock provider', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const { order, items } = await service.createBooking(makeActor(), 'site-1', baseInput(), 'req-1')

    expect(order.status).toBe('VOUCHER_ISSUED')
    expect(order.providerOrderId).toBeTruthy()
    expect(order.totalAmount).toBe(890_000 * 2)
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)

    const { vouchers } = await service.getBooking(makeActor(), order.id)
    expect(vouchers).toHaveLength(1)
  })

  it('returns the existing order instead of creating a duplicate on a repeated idempotencyKey', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const input = baseInput()

    const first = await service.createBooking(makeActor(), 'site-1', input, 'req-1')
    const second = await service.createBooking(makeActor(), 'site-1', input, 'req-2')

    expect(second.order.id).toBe(first.order.id)
  })

  it('rejects checkout when the provider reports insufficient stock', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const input = baseInput({ items: [{ attractionProductId: PRODUCT.id, providerVariantId: 'mock-variant-soldout', usageDate: '2026-08-01', quantity: 1 }] })

    await expect(service.createBooking(makeActor(), 'site-1', input, 'req-1')).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('rejects checkout for a product that does not belong to the given website', async () => {
    const repository = makeFakeRepository({ findProductById: async () => ({ ...PRODUCT, websiteId: 'other-site' }) })
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())

    await expect(service.createBooking(makeActor(), 'site-1', baseInput(), 'req-1')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('AttractionBookingService.createGuestBooking', () => {
  it('creates an order with no actor — createdBy is null, audit logs a null actorUserId', async () => {
    const repository = makeFakeRepository()
    const auditLogger = vi.fn(async () => {})
    const service = new AttractionBookingService(repository, auditLogger, new MockAttractionTicketProvider())

    const { order } = await service.createGuestBooking('site-1', baseInput(), 'req-1')

    expect(order.createdBy).toBeNull()
    expect(auditLogger).toHaveBeenCalledWith(expect.objectContaining({ actorUserId: null, action: 'attraction_ticket.booking.created' }))
  })

  it('is idempotent the same way createBooking is', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const input = baseInput()

    const first = await service.createGuestBooking('site-1', input, 'req-1')
    const second = await service.createGuestBooking('site-1', input, 'req-2')

    expect(second.order.id).toBe(first.order.id)
  })
})

describe('AttractionBookingService.getBookingForCustomer', () => {
  it('returns the order when order_code + email match', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const { order } = await service.createGuestBooking('site-1', baseInput(), 'req-1')

    const found = await service.getBookingForCustomer(order.orderCode, order.customerEmail)
    expect(found.order.id).toBe(order.id)
  })

  it('throws NOT_FOUND when the email does not match', async () => {
    const repository = makeFakeRepository({ findOrderByCodeForCustomer: async () => null })
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    await expect(service.getBookingForCustomer('MV-260101-ABCDEF', 'wrong@example.com')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

describe('AttractionBookingService.cancelBooking', () => {
  it('cancels a confirmed booking via the provider and updates local status', async () => {
    const repository = makeFakeRepository()
    const provider = new MockAttractionTicketProvider()
    const service = new AttractionBookingService(repository, noopAuditLogger, provider)
    const { order } = await service.createBooking(makeActor(), 'site-1', {
      websiteId: 'site-1',
      idempotencyKey: '22222222-2222-2222-2222-222222222222',
      items: [{ attractionProductId: PRODUCT.id, providerVariantId: 'mock-variant-adult', usageDate: '2026-08-01', quantity: 1 }],
      customerName: 'Nguyễn Văn B',
      customerPhone: '0900000001',
      customerEmail: 'b@example.com',
    }, 'req-1')

    const cancelled = await service.cancelBooking(makeActor(), order.id, 'req-2')
    expect(cancelled.status).toBe('CANCELLED')

    const providerStatus = await provider.queryOrderStatus(order.providerOrderId as string)
    expect(providerStatus.status).toBe('CANCELLED')
  })

  it('denies cancellation for an actor lacking attraction_ticket.booking.cancel', async () => {
    const repository = makeFakeRepository()
    const service = new AttractionBookingService(repository, noopAuditLogger, new MockAttractionTicketProvider())
    const actor = makeActor({ permissions: new Set(['attraction_ticket.booking.read']) })

    await expect(service.cancelBooking(actor, 'order-1', 'req-1')).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })
})

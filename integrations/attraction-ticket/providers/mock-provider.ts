import { AppError } from '@/shared/errors/app-error'
import { findMockVariant, MOCK_VARIANTS } from '@/integrations/attraction-ticket/providers/mock-data'
import type {
  AttractionTicketProvider,
  ProviderIdMapping,
  TicketAvailability,
  TicketOrder,
} from '@/integrations/attraction-ticket/contracts/attraction-ticket-provider'

type MockOrder = {
  providerOrderId: string
  providerVariantId: string
  quantity: number
  date: string
  status: TicketOrder['status']
  voucherId: string | null
}

/**
 * Deterministic, in-process implementation of `AttractionTicketProvider` —
 * no HTTP calls, no environment variables, never touches the real
 * OneInventory sandbox. Selected by `getAttractionTicketProvider()`
 * whenever `ONEINVENTORY_ENABLED` is unset/false (the Phase 1 default),
 * so Phase 2's UI and every application-service test can run against a
 * stable, known dataset before the real Adapter exists
 * (docs/mv-ticket/06-implementation-plan.md Phase 1/2).
 *
 * State (`orders`) lives on the instance, not module scope — each `new
 * MockAttractionTicketProvider()` starts clean, which is what makes it
 * safe to use in unit tests without cross-test leakage.
 */
export class MockAttractionTicketProvider implements AttractionTicketProvider {
  private readonly orders = new Map<string, MockOrder>()
  private orderSequence = 0

  async syncProducts(): Promise<ProviderIdMapping[]> {
    // Deliberately returns mappings that won't match any real local
    // product id — a fresh install has created no products yet, so a
    // realistic mock result is "provider knows about products, none are
    // linked locally," exercising AttractionSyncService's skip-when-
    // unmatched path (matched: 0, total: N) rather than pretending a
    // match that can't exist in a database this mock knows nothing about.
    return [
      { internalProductId: '00000000-0000-0000-0000-000000000001', providerProductId: 'mock-product-1', providerVariantId: 'mock-variant-adult' },
      { internalProductId: '00000000-0000-0000-0000-000000000002', providerProductId: 'mock-product-2', providerVariantId: 'mock-variant-child' },
    ]
  }

  async syncVariants(providerProductId: string): Promise<ProviderIdMapping[]> {
    return MOCK_VARIANTS.map((v) => ({
      internalProductId: '00000000-0000-0000-0000-000000000000',
      providerProductId,
      providerVariantId: v.providerVariantId,
    }))
  }

  async searchAvailability(providerVariantId: string, date: string): Promise<TicketAvailability> {
    const variant = findMockVariant(providerVariantId)
    if (!variant) throw AppError.notFound('MockTicketVariant', providerVariantId)
    return { providerVariantId, date, remaining: variant.remaining, price: variant.price, currency: variant.currency }
  }

  revalidatePrice(providerVariantId: string, date: string): Promise<TicketAvailability> {
    return this.searchAvailability(providerVariantId, date)
  }

  async createOrder(providerVariantId: string, quantity: number, date: string): Promise<TicketOrder> {
    const variant = findMockVariant(providerVariantId)
    if (!variant) throw AppError.notFound('MockTicketVariant', providerVariantId)
    if (variant.remaining !== null && variant.remaining < quantity) {
      throw AppError.conflict('Không đủ vé khả dụng cho ngày đã chọn', { requested: quantity, remaining: variant.remaining })
    }

    this.orderSequence += 1
    const providerOrderId = `mock-order-${this.orderSequence}`
    const voucherId = `mock-voucher-${this.orderSequence}`
    const order: MockOrder = { providerOrderId, providerVariantId, quantity, date, status: 'CONFIRMED', voucherId }
    this.orders.set(providerOrderId, order)
    return { providerOrderId, status: order.status, voucherId }
  }

  async retrieveVoucher(providerOrderId: string): Promise<{ voucherId: string; downloadUrl: string }> {
    const order = this.orders.get(providerOrderId)
    if (!order?.voucherId) throw AppError.notFound('MockTicketOrder', providerOrderId)
    return { voucherId: order.voucherId, downloadUrl: `https://mock.oneinventory.local/vouchers/${order.voucherId}.pdf` }
  }

  async cancelOrder(providerOrderId: string): Promise<void> {
    const order = this.orders.get(providerOrderId)
    if (!order) throw AppError.notFound('MockTicketOrder', providerOrderId)
    order.status = 'CANCELLED'
  }

  async changeUsageDate(providerOrderId: string, newDate: string): Promise<TicketOrder> {
    const order = this.orders.get(providerOrderId)
    if (!order) throw AppError.notFound('MockTicketOrder', providerOrderId)
    order.date = newDate
    return { providerOrderId, status: order.status, voucherId: order.voucherId }
  }

  async queryOrderStatus(providerOrderId: string): Promise<TicketOrder> {
    const order = this.orders.get(providerOrderId)
    if (!order) throw AppError.notFound('MockTicketOrder', providerOrderId)
    return { providerOrderId, status: order.status, voucherId: order.voucherId }
  }
}

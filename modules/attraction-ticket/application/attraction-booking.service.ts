import { AppError } from '@/shared/errors/app-error'
import { requirePermission, type ActorContext } from '@/shared/auth/guards'
import type { AuditLogger } from '@/modules/audit/domain/types'
import type { AttractionTicketRepository } from '@/modules/attraction-ticket/infrastructure/attraction-ticket.repository'
import type { AttractionOrderStatus } from '@/modules/attraction-ticket/domain/types'
import type { AttractionCheckoutCreateInput } from '@/modules/attraction-ticket/schemas/attraction-ticket.schema'
import type { AttractionTicketProvider, TicketOrder } from '@/integrations/attraction-ticket/contracts/attraction-ticket-provider'

const PROVIDER_STATUS_MAP: Record<TicketOrder['status'], AttractionOrderStatus> = {
  PENDING: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  // No separate "redeemed" state in V1's enum — a ticket already marked
  // USED by the provider necessarily already has a voucher, so it's
  // represented the same as VOUCHER_ISSUED here.
  USED: 'VOUCHER_ISSUED',
}

/** `MV-<yymmdd>-<6 random base36 chars>` — readable, not guessable enough to enumerate (not a security boundary itself; access to order detail is additionally gated by order_code + email, see docs/mv-ticket/03-database-design.md §4). */
function generateOrderCode(): string {
  const date = new Date()
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `MV-${yy}${mm}${dd}-${suffix}`
}

/**
 * First real Booking/Order domain service in this codebase — no existing
 * Flight/Tour backend booking service to mirror (docs/mv-ticket/00-current
 * -state-audit.md §2). `provider` is injected via constructor exactly like
 * `repository` — the service never imports a concrete provider class, only
 * the `AttractionTicketProvider` interface (brief §I.9 "phải có lớp
 * Adapter"). In Phase 1 the caller injects `MockAttractionTicketProvider`;
 * Phase 3 swaps in `OneInventoryProvider` with zero change to this file.
 */
export class AttractionBookingService {
  constructor(
    private readonly repository: AttractionTicketRepository,
    private readonly auditLogger: AuditLogger,
    private readonly provider: AttractionTicketProvider,
  ) {}

  /**
   * Public, unauthenticated checkout (docs/mv-ticket/01-product-scope.md
   * §5 "guest checkout"). Caller (the booking API route) must construct
   * this service's repository with `getAdminSupabaseClient()`, not the
   * session client — `attraction_orders` has no anon INSERT policy
   * (database/policies/0004_attraction_ticket_policies.sql), exactly the
   * same shape as the public form-submission route
   * (`shared/supabase/admin-client.ts`'s 3rd documented exception).
   */
  createGuestBooking(websiteId: string, input: AttractionCheckoutCreateInput, requestId: string) {
    return this.createOrderInternal(websiteId, input, requestId, null, null)
  }

  /**
   * Staff-initiated booking (e.g. a BOOKING-role employee taking a phone
   * order on a customer's behalf) — requires no extra permission beyond
   * being an authenticated staff member, since it creates a new order
   * rather than reading/modifying someone else's.
   */
  createBooking(actor: ActorContext, websiteId: string, input: AttractionCheckoutCreateInput, requestId: string) {
    return this.createOrderInternal(websiteId, input, requestId, actor.userId, actor.organizationId)
  }

  /**
   * Idempotent: a repeat call with the same `idempotencyKey` (e.g. a
   * double-click or a client retry after a dropped response) returns the
   * already-created order instead of creating a second one — enforced both
   * here (early return) and at the DB level (`attraction_orders
   * .idempotency_key` unique constraint) as defense-in-depth.
   */
  private async createOrderInternal(
    websiteId: string,
    input: AttractionCheckoutCreateInput,
    requestId: string,
    createdBy: string | null,
    organizationId: string | null,
  ) {
    const existing = await this.repository.findOrderByIdempotencyKey(input.idempotencyKey)
    if (existing) return { order: existing, items: await this.repository.listOrderItems(existing.id) }

    const [item] = input.items
    const product = await this.repository.findProductById(item.attractionProductId)
    if (!product || product.status !== 'ACTIVE' || product.websiteId !== websiteId) {
      throw AppError.notFound('AttractionProduct', item.attractionProductId)
    }

    const availability = await this.provider.revalidatePrice(item.providerVariantId, item.usageDate)
    if (availability.remaining !== null && availability.remaining < item.quantity) {
      throw AppError.conflict('Không đủ vé khả dụng cho ngày đã chọn', {
        requested: item.quantity,
        remaining: availability.remaining,
      })
    }
    const totalAmount = availability.price * item.quantity

    const providerOrder = await this.provider.createOrder(item.providerVariantId, item.quantity, item.usageDate)

    const { order, items } = await this.repository.createOrder(
      {
        websiteId,
        orderCode: generateOrderCode(),
        idempotencyKey: input.idempotencyKey,
        providerCode: 'ONEINVENTORY',
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        note: input.note ?? null,
        totalAmount,
        createdBy,
      },
      [
        {
          attractionProductId: item.attractionProductId,
          providerVariantId: item.providerVariantId,
          usageDate: item.usageDate,
          quantity: item.quantity,
          unitPrice: availability.price,
          ticketHolderName: item.ticketHolderName ?? null,
        },
      ],
    )

    let finalOrder = await this.repository.updateOrderStatus(order.id, PROVIDER_STATUS_MAP[providerOrder.status], {
      providerOrderId: providerOrder.providerOrderId,
    })

    await this.auditLogger({
      actorUserId: createdBy,
      organizationId,
      websiteId,
      action: 'attraction_ticket.booking.created',
      entityType: 'attraction_order',
      entityId: order.id,
      requestId,
      source: createdBy ? 'admin-ui' : 'api',
    })

    // Provider already confirmed + issued a voucher at order-creation time
    // (mock provider does this synchronously; a real provider's step 7
    // "xác nhận thanh toán -> tự động xuất vé" happens on a later,
    // separate call once the contract gains `confirmPayment` — see
    // docs/mv-ticket/02-system-architecture.md §5).
    if (providerOrder.status === 'CONFIRMED' && providerOrder.voucherId) {
      finalOrder = await this.issueVoucher(finalOrder.id, providerOrder.providerOrderId, requestId, createdBy, organizationId)
    }

    return { order: finalOrder, items }
  }

  private async issueVoucher(orderId: string, providerOrderId: string, requestId: string, actorUserId: string | null, organizationId: string | null) {
    const voucher = await this.provider.retrieveVoucher(providerOrderId)
    await this.repository.createVoucher(orderId, { providerVoucherId: voucher.voucherId, downloadUrl: voucher.downloadUrl })
    const order = await this.repository.updateOrderStatus(orderId, 'VOUCHER_ISSUED')
    await this.auditLogger({
      actorUserId,
      organizationId,
      action: 'attraction_ticket.voucher.issued',
      entityType: 'attraction_order',
      entityId: orderId,
      requestId,
    })
    return order
  }

  /**
   * Guest-facing lookup — access is gated by knowing both `orderCode` and
   * the email used at checkout (matching the OneAPI changelog's own
   * "bổ sung thông tin email để xác thực truy cập thông tin đơn hàng"
   * addition, v1.1), never a bare guessable id in a URL. Caller must
   * construct this service's repository with `getAdminSupabaseClient()`
   * (same reasoning as `createGuestBooking`) — RLS on `attraction_orders`
   * is staff-only, so a session/anon client would return zero rows
   * regardless of whether the email matches.
   */
  async getBookingForCustomer(orderCode: string, email: string) {
    const order = await this.repository.findOrderByCodeForCustomer(orderCode, email)
    if (!order) throw AppError.notFound('AttractionOrder', orderCode)
    const [items, vouchers] = await Promise.all([this.repository.listOrderItems(order.id), this.repository.listVouchers(order.id)])
    return { order, items, vouchers }
  }

  async getBooking(actor: ActorContext, id: string) {
    requirePermission(actor, 'attraction_ticket.booking.read')
    const order = await this.repository.findOrderById(id)
    if (!order) throw AppError.notFound('AttractionOrder', id)
    const [items, vouchers] = await Promise.all([this.repository.listOrderItems(id), this.repository.listVouchers(id)])
    return { order, items, vouchers }
  }

  async cancelBooking(actor: ActorContext, id: string, requestId: string) {
    requirePermission(actor, 'attraction_ticket.booking.cancel')
    const order = await this.repository.findOrderById(id)
    if (!order) throw AppError.notFound('AttractionOrder', id)
    if (order.status === 'CANCELLED') return order
    if (!order.providerOrderId) {
      throw AppError.conflict('Cannot cancel an order that was never confirmed with the provider')
    }
    await this.provider.cancelOrder(order.providerOrderId)
    const cancelled = await this.repository.updateOrderStatus(id, 'CANCELLED')
    await this.auditLogger({
      actorUserId: actor.userId,
      organizationId: actor.organizationId,
      action: 'attraction_ticket.booking.cancelled',
      entityType: 'attraction_order',
      entityId: id,
      requestId,
    })
    return cancelled
  }
}

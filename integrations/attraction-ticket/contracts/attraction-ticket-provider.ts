/**
 * Contract for future attraction-ticket providers (EZ OneAPI,
 * VinWonders, Sun World, TTC, NovaWorld, ...). Not implemented in
 * Sprint 1 (master-prompt §9.2) — this is the interface a real adapter
 * conforms to later, and the id-mapping shape the future product/order
 * tables will store per provider.
 */
export type ProviderIdMapping = {
  internalProductId: string
  providerProductId: string
  providerVariantId?: string
  providerLocationId?: string
}

export type TicketAvailability = {
  providerVariantId: string
  date: string
  remaining: number | null
  price: number
  currency: string
}

export type TicketOrder = {
  providerOrderId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'USED'
  voucherId: string | null
}

export interface AttractionTicketProvider {
  syncProducts(): Promise<ProviderIdMapping[]>
  syncVariants(providerProductId: string): Promise<ProviderIdMapping[]>
  searchAvailability(providerVariantId: string, date: string): Promise<TicketAvailability>
  revalidatePrice(providerVariantId: string, date: string): Promise<TicketAvailability>
  createOrder(providerVariantId: string, quantity: number, date: string): Promise<TicketOrder>
  retrieveVoucher(providerOrderId: string): Promise<{ voucherId: string; downloadUrl: string }>
  cancelOrder(providerOrderId: string): Promise<void>
  changeUsageDate(providerOrderId: string, newDate: string): Promise<TicketOrder>
  queryOrderStatus(providerOrderId: string): Promise<TicketOrder>
}

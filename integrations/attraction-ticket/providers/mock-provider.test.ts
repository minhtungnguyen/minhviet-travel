import { describe, expect, it } from 'vitest'
import { MockAttractionTicketProvider } from '@/integrations/attraction-ticket/providers/mock-provider'

describe('MockAttractionTicketProvider', () => {
  it('createOrder confirms immediately and issues a voucher for an in-stock variant', async () => {
    const provider = new MockAttractionTicketProvider()
    const order = await provider.createOrder('mock-variant-adult', 2, '2026-08-01')
    expect(order.status).toBe('CONFIRMED')
    expect(order.voucherId).toBeTruthy()

    const voucher = await provider.retrieveVoucher(order.providerOrderId)
    expect(voucher.voucherId).toBe(order.voucherId)
    expect(voucher.downloadUrl).toContain(order.voucherId)
  })

  it('createOrder rejects a quantity above the mock remaining stock', async () => {
    await expect(new MockAttractionTicketProvider().createOrder('mock-variant-soldout', 1, '2026-08-01')).rejects.toMatchObject({
      code: 'CONFLICT',
    })
  })

  it('searchAvailability and revalidatePrice agree for the same variant/date', async () => {
    const provider = new MockAttractionTicketProvider()
    const a = await provider.searchAvailability('mock-variant-child', '2026-08-01')
    const b = await provider.revalidatePrice('mock-variant-child', '2026-08-01')
    expect(a).toEqual(b)
  })

  it('throws NOT_FOUND for an unknown variant id', async () => {
    await expect(new MockAttractionTicketProvider().searchAvailability('does-not-exist', '2026-08-01')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('cancelOrder marks a created order CANCELLED, reflected by queryOrderStatus', async () => {
    const provider = new MockAttractionTicketProvider()
    const order = await provider.createOrder('mock-variant-adult', 1, '2026-08-01')
    await provider.cancelOrder(order.providerOrderId)
    const status = await provider.queryOrderStatus(order.providerOrderId)
    expect(status.status).toBe('CANCELLED')
  })

  it('cancelOrder on an unknown order id throws NOT_FOUND', async () => {
    await expect(new MockAttractionTicketProvider().cancelOrder('does-not-exist')).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('a fresh instance has no memory of orders created on a previous instance', async () => {
    const first = new MockAttractionTicketProvider()
    const order = await first.createOrder('mock-variant-adult', 1, '2026-08-01')
    const second = new MockAttractionTicketProvider()
    await expect(second.queryOrderStatus(order.providerOrderId)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})

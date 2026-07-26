import { test, expect } from 'vitest'
import { flightSearchInputSchema } from './flight-schema'

function input(overrides: Partial<Parameters<typeof flightSearchInputSchema.parse>[0]> = {}) {
  return {
    tripType: 'oneway' as const,
    originCode: 'HPH',
    destinationCode: 'SGN',
    departDate: '2026-08-01',
    returnDate: undefined,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy' as const,
    ...overrides,
  }
}

test('valid one-way search passes', () => {
  const result = flightSearchInputSchema.safeParse(input())
  expect(result.success).toBe(true)
})

test('round trip without return date fails', () => {
  const result = flightSearchInputSchema.safeParse(input({ tripType: 'roundtrip' }))
  expect(result.success).toBe(false)
})

test('round trip with return date before depart date fails', () => {
  const result = flightSearchInputSchema.safeParse(
    input({ tripType: 'roundtrip', departDate: '2026-08-10', returnDate: '2026-08-05' }),
  )
  expect(result.success).toBe(false)
})

test('round trip with valid return date passes', () => {
  const result = flightSearchInputSchema.safeParse(
    input({ tripType: 'roundtrip', departDate: '2026-08-10', returnDate: '2026-08-15' }),
  )
  expect(result.success).toBe(true)
})

test('same origin and destination fails', () => {
  const result = flightSearchInputSchema.safeParse(input({ destinationCode: 'HPH' }))
  expect(result.success).toBe(false)
})

test('more infants than adults fails', () => {
  const result = flightSearchInputSchema.safeParse(input({ adults: 1, infants: 2 }))
  expect(result.success).toBe(false)
})

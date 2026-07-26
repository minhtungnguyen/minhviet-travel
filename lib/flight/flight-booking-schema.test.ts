import { test, expect } from 'vitest'
import { bookingContactSchema, createPassengerSchema, bookingTermsSchema } from '@/lib/flight/flight-booking-schema'

const departDate = '2026-08-20'

function passenger(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'p1',
    type: 'adult' as const,
    fullName: 'Nguyễn Văn A',
    gender: 'male' as const,
    dateOfBirth: '1990-01-01',
    nationality: 'Việt Nam',
    documentType: 'cccd' as const,
    documentNumber: '012345678901',
    ...overrides,
  }
}

test('bookingContactSchema rejects invalid email/short phone', () => {
  expect(bookingContactSchema.safeParse({ fullName: 'Nguyễn Văn A', email: 'not-an-email', phone: '0934368132' }).success).toBe(false)
  expect(bookingContactSchema.safeParse({ fullName: 'Nguyễn Văn A', email: 'a@b.com', phone: '123' }).success).toBe(false)
  expect(bookingContactSchema.safeParse({ fullName: 'Nguyễn Văn A', email: 'a@b.com', phone: '0934368132' }).success).toBe(true)
})

test('adult passenger schema accepts a 36-year-old as of departure date', () => {
  const schema = createPassengerSchema('adult', departDate)
  expect(schema.safeParse(passenger()).success).toBe(true)
})

test('adult passenger schema rejects an 8-year-old', () => {
  const schema = createPassengerSchema('adult', departDate)
  const result = schema.safeParse(passenger({ dateOfBirth: '2018-01-01' }))
  expect(result.success).toBe(false)
})

test('child passenger schema accepts age exactly at the lower boundary (2 years old as of departure)', () => {
  const schema = createPassengerSchema('child', departDate)
  const result = schema.safeParse(passenger({ type: 'child', dateOfBirth: '2024-07-01' }))
  expect(result.success).toBe(true)
})

test('infant passenger schema rejects a date of birth after the departure date', () => {
  const schema = createPassengerSchema('infant', departDate)
  const result = schema.safeParse(passenger({ type: 'infant', dateOfBirth: '2026-09-01' }))
  expect(result.success).toBe(false)
})

test('bookingTermsSchema requires true, not just any truthy value', () => {
  expect(bookingTermsSchema.safeParse(true).success).toBe(true)
  expect(bookingTermsSchema.safeParse(false).success).toBe(false)
})

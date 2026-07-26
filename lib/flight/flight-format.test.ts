import { test, expect } from 'vitest'
import { formatClockTime, formatDuration, formatStopsLabel } from '@/lib/flight/flight-format'

test('formatClockTime reads UTC hours/minutes regardless of local timezone', () => {
  expect(formatClockTime('2026-08-20T05:30:00.000Z')).toBe('05:30')
  expect(formatClockTime('2026-08-20T23:05:00.000Z')).toBe('23:05')
})

test('formatDuration', () => {
  expect(formatDuration(60)).toBe('1h')
  expect(formatDuration(95)).toBe('1h35')
})

test('formatStopsLabel', () => {
  expect(formatStopsLabel(0)).toBe('Bay thẳng')
  expect(formatStopsLabel(1)).toBe('1 điểm dừng')
})

import { describe, expect, it } from 'vitest'
import { insuranceLandingContentSchema, insuranceArticleSchema } from '@/lib/insurance/insurance-schema'
import { insuranceContentSeed } from '@/lib/insurance/insurance-content-seed'
import { insuranceArticlesSeed } from '@/lib/insurance/insurance-articles-seed'
import { insurancePremiumTableSeed } from '@/lib/insurance/insurance-premium-table-seed'

const ZONE_COUNT = 3
const PLAN_COUNT = 3
const DURATION_BAND_COUNT = 26

describe('insurance seed data integrity', () => {
  it('the full seeded landing content parses against the schema', () => {
    expect(() => insuranceLandingContentSchema.parse(insuranceContentSeed)).not.toThrow()
  })

  it('the full seeded articles list parses against the schema', () => {
    expect(() => insuranceArticleSchema.array().parse(insuranceArticlesSeed)).not.toThrow()
  })

  it('has exactly one premium rate per (zone, plan, duration band) — no gaps, no duplicates', () => {
    expect(insurancePremiumTableSeed).toHaveLength(ZONE_COUNT * PLAN_COUNT * DURATION_BAND_COUNT)
    const seen = new Set<string>()
    for (const rate of insurancePremiumTableSeed) {
      const key = `${rate.zone}|${rate.plan}|${rate.minDays}-${rate.maxDays}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
    expect(seen.size).toBe(ZONE_COUNT * PLAN_COUNT * DURATION_BAND_COUNT)
  })

  it('has between 6 and 8 seeded articles, per the brief', () => {
    expect(insuranceArticlesSeed.length).toBeGreaterThanOrEqual(6)
    expect(insuranceArticlesSeed.length).toBeLessThanOrEqual(8)
  })

  it('every article has a unique slug', () => {
    const slugs = insuranceArticlesSeed.map((a) => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

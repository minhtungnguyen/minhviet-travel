import type { ConfidenceLevel } from '@/types/cms'
import type { JourneyContent } from '@/types/homepage'
import type { AIAdvisorInput, AIAdvisorMatch, AIAdvisorResult } from '@/types/ai-advisor'

/**
 * Deterministic, explainable matching against real CMS journey data.
 *
 * This deliberately does NOT fabricate a precision percentage (the audit
 * flagged the old homepage's static 96%/91%/88% mockup scores as a
 * direct violation of Volume 02 Ch.17.7). Every match is a plain count
 * of which of the visitor's three real inputs actually overlap with the
 * journey's tags, surfaced as a confidence band plus the concrete
 * reasons and gaps — nothing here is invented.
 */

const CRITERIA_COUNT = 3
const MAX_RESULTS = 3

function confidenceFromScore(score: number): ConfidenceLevel {
  if (score === CRITERIA_COUNT) return 'high'
  if (score === CRITERIA_COUNT - 1) return 'medium'
  return 'low'
}

const CRITERION_LABELS = {
  budget: 'ngân sách',
  groupSize: 'quy mô đoàn',
  preference: 'ưu tiên điểm đến',
} as const

export function matchJourneys(
  input: AIAdvisorInput,
  catalog: JourneyContent[],
): AIAdvisorResult {
  const scored = catalog.map((journey) => {
    const budgetMatch = journey.matchTags.includes(`budget:${input.budget}`)
    const groupMatch = journey.matchTags.includes(`group:${input.groupSize}`)
    const preferenceMatch = journey.matchTags.includes(`preference:${input.preference}`)

    const score = [budgetMatch, groupMatch, preferenceMatch].filter(Boolean).length

    const reasons: string[] = []
    const unmatchedCriteria: string[] = []

    if (budgetMatch) reasons.push(`Phù hợp ${CRITERION_LABELS.budget} bạn chọn`)
    else unmatchedCriteria.push(CRITERION_LABELS.budget)

    if (groupMatch) reasons.push(`Phù hợp ${CRITERION_LABELS.groupSize} bạn chọn`)
    else unmatchedCriteria.push(CRITERION_LABELS.groupSize)

    if (preferenceMatch) reasons.push(`Khớp ${CRITERION_LABELS.preference} bạn ưu tiên`)
    else unmatchedCriteria.push(CRITERION_LABELS.preference)

    const match: AIAdvisorMatch = {
      journeyId: journey.id,
      title: journey.title,
      href: journey.href,
      confidence: confidenceFromScore(score),
      reasons,
      unmatchedCriteria,
    }

    return { match, score }
  })

  const matches = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((entry) => entry.match)

  return {
    input,
    matches,
    generatedAt: new Date().toISOString(),
  }
}

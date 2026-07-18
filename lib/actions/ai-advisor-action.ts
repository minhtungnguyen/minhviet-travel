'use server'

import { aiAdvisorInputSchema } from '@/lib/cms/schema'
import { matchJourneys } from '@/lib/ai/match-engine'
import { getHomepageContent } from '@/lib/cms/client'
import type { AIAdvisorActionState } from '@/types/ai-advisor'

/**
 * Runs the AI Advisor against real CMS journey data. Risk level per
 * Volume 01 Ch.15 is Level 2 (Moderate) — a recommendation, not a
 * booking or price commitment — so no human approval gate is required
 * before showing a result, but the result itself must disclose that a
 * human will confirm it (enforced in the UI via `aiAdvisor.disclosureNote`).
 */
export async function runAIAdvisorAction(
  _prevState: AIAdvisorActionState,
  formData: FormData,
): Promise<AIAdvisorActionState> {
  const parsed = aiAdvisorInputSchema.safeParse({
    budget: formData.get('budget'),
    groupSize: formData.get('groupSize'),
    preference: formData.get('preference'),
  })

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return {
      status: 'error',
      message: firstIssue?.message ?? 'Vui lòng trả lời đầy đủ ba câu hỏi.',
    }
  }

  const content = await getHomepageContent()
  const result = matchJourneys(parsed.data, content.featuredJourneys.journeys)

  return { status: 'success', result }
}

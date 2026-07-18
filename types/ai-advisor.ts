import type { ConfidenceLevel } from '@/types/cms'

export interface AIAdvisorInput {
  budget: string
  groupSize: string
  preference: string
}

export interface AIAdvisorMatch {
  journeyId: string
  title: string
  href: string
  confidence: ConfidenceLevel
  reasons: string[]
  unmatchedCriteria: string[]
}

export interface AIAdvisorResult {
  input: AIAdvisorInput
  matches: AIAdvisorMatch[]
  generatedAt: string
}

export type AIAdvisorActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; result: AIAdvisorResult }

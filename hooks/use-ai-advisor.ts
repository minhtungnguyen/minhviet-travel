'use client'

import { useActionState, useState } from 'react'
import { runAIAdvisorAction } from '@/lib/actions/ai-advisor-action'
import type { AIAdvisorActionState, AIAdvisorInput } from '@/types/ai-advisor'

const INITIAL_STATE: AIAdvisorActionState = { status: 'idle' }

type AdvisorFieldId = keyof AIAdvisorInput

/**
 * Drives the 3-step AI Advisor flow: one question visible at a time on
 * mobile-sized viewports (progressive disclosure per Volume 02 Ch.2
 * Principle 3), backed by the server action that runs the real matching
 * engine. `values` stays controlled client-side so the step UI can
 * validate/advance without a round trip; the server action re-validates
 * everything before computing a result.
 */
export function useAIAdvisor(fieldOrder: AdvisorFieldId[]) {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState<Partial<AIAdvisorInput>>({})
  const [state, formAction, isPending] = useActionState(runAIAdvisorAction, INITIAL_STATE)

  const currentField = fieldOrder[stepIndex]
  const isLastStep = stepIndex === fieldOrder.length - 1
  const canAdvance = currentField ? Boolean(values[currentField]) : false

  function setValue(field: AdvisorFieldId, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function goNext() {
    if (canAdvance && !isLastStep) setStepIndex((i) => i + 1)
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  function reset() {
    setStepIndex(0)
    setValues({})
  }

  return {
    stepIndex,
    stepCount: fieldOrder.length,
    currentField,
    isLastStep,
    canAdvance,
    values,
    setValue,
    goNext,
    goBack,
    reset,
    state,
    formAction,
    isPending,
  }
}

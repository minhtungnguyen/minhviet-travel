'use client'

import { useActionState } from 'react'
import { submitLeadAction, type LeadActionState } from '@/lib/actions/lead-action'

const INITIAL_STATE: LeadActionState = { status: 'idle' }

/**
 * Shared by both the corporate and individual inquiry forms in
 * `DualPathCTA` — one hook, one action, two intents — so the two forms
 * don't diverge into separate submit/error/success implementations.
 */
export function useLeadForm() {
  const [state, formAction, isPending] = useActionState(submitLeadAction, INITIAL_STATE)
  return { state, formAction, isPending }
}

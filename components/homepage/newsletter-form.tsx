'use client'

import { useActionState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { subscribeNewsletterAction, type NewsletterActionState } from '@/lib/actions/newsletter-action'

const INITIAL_STATE: NewsletterActionState = { status: 'idle' }

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeNewsletterAction, INITIAL_STATE)

  if (state.status === 'success') {
    return (
      <p className="flex items-center gap-2 text-sm text-mv-deep-navy" aria-live="polite">
        <CheckCircle2 className="size-4 text-mv-journey-blue" />
        {state.message}
      </p>
    )
  }

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-2">
      <div className="flex items-center gap-3">
        <Input
          type="email"
          name="email"
          required
          placeholder="Nhập email của bạn"
          aria-label="Email"
          aria-invalid={state.status === 'error'}
          className="h-12 flex-1 border-mv-border-soft bg-white text-mv-deep-navy placeholder:text-mv-slate/60 focus-visible:border-mv-sky-cyan/60 focus-visible:ring-mv-sky-cyan/25"
        />
        <Button type="submit" variant="journey" size="lg" disabled={isPending}>
          {isPending ? 'Đang gửi...' : 'Đăng ký'}
        </Button>
      </div>
      {state.status === 'error' && (
        <p role="alert" className="text-xs text-destructive">
          {state.message}
        </p>
      )}
    </form>
  )
}

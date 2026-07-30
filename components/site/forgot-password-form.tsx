'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show the same success state regardless of the response body —
      // the API itself never reveals whether the email exists (master-prompt §12).
      if (res.ok) {
        setSent(true)
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-secondary px-3.5 py-3 text-sm leading-relaxed text-secondary-foreground">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
        Nếu email này đã đăng ký, bạn sẽ nhận được đường dẫn đặt lại mật khẩu trong ít phút.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Email</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-13 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-xs leading-relaxed text-destructive" role="alert">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <MVButton type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
        Gửi đường dẫn đặt lại mật khẩu
      </MVButton>
    </form>
  )
}

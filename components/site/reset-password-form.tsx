'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { MVButton } from '@/components/mv/mv-button'

type SessionCheck = 'checking' | 'valid' | 'expired'

export function ResetPasswordForm() {
  const router = useRouter()
  const [sessionState, setSessionState] = useState<SessionCheck>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/auth/session')
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return
        setSessionState(body?.data?.authenticated ? 'valid' : 'expired')
      })
      .catch(() => {
        if (!cancelled) setSessionState('expired')
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/auth/password-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error?.message ?? 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
        setLoading(false)
        return
      }
      router.push('/login?reset=success')
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  if (sessionState === 'checking') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang kiểm tra đường dẫn...
      </div>
    )
  }

  if (sessionState === 'expired') {
    return (
      <div className="space-y-4">
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          Đường dẫn đã hết hạn hoặc không hợp lệ.
        </p>
        <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
          Yêu cầu đường dẫn mới
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Mật khẩu mới</span>
        <div className="relative mt-1.5">
          <input
            required
            minLength={8}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-13 w-full rounded-lg border border-border bg-background px-3.5 pr-11 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Nhập lại mật khẩu mới</span>
        <input
          required
          minLength={8}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        Đặt lại mật khẩu
      </MVButton>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { loginAction } from '@/app/login/actions'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email hoặc mật khẩu không đúng.',
  account_disabled: 'Tài khoản này hiện không thể truy cập. Vui lòng liên hệ quản trị viên.',
}

export function LoginForm({
  next,
  banner,
}: {
  next?: string
  /** Pre-filled notice from a redirect (session expired, reset-link expired, password reset succeeded). */
  banner?: { type: 'error' | 'success'; message: string }
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await loginAction(email, password, next ?? null)
      if (!result.ok) {
        setError(ERROR_MESSAGES[result.reason] ?? ERROR_MESSAGES.invalid_credentials)
        setLoading(false)
        return
      }
      router.push(result.redirectTo)
      router.refresh()
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {banner && !error && (
        <p
          className={
            banner.type === 'success'
              ? 'flex items-start gap-2 rounded-lg bg-secondary px-3.5 py-3 text-xs leading-relaxed text-secondary-foreground'
              : 'flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-xs leading-relaxed text-destructive'
          }
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
          ) : (
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          )}
          {banner.message}
        </p>
      )}

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

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Mật khẩu</span>
        <div className="relative mt-1.5">
          <input
            required
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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

      <div className="flex justify-end text-sm">
        <a href="/forgot-password" className="font-medium text-mv-journey-blue hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-xs leading-relaxed text-destructive" role="alert">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <MVButton type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
        Đăng nhập
      </MVButton>
    </form>
  )
}

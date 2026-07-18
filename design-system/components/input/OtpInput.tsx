'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { FieldShell, fieldErrorClass, type FieldShellProps } from './_shared'

export type OtpInputProps = Omit<FieldShellProps, 'children' | 'htmlFor'> & {
  length?: number
  value: string
  onChange: (value: string) => void
  className?: string
}

/** Fixed-length one-time-passcode field: one focus-managed box per digit. */
export function OtpInput({
  label,
  helperText,
  error,
  required,
  className,
  length = 6,
  value,
  onChange,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice()
    next[index] = digit
    onChange(next.join(''))
  }

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      className={className}
    >
      <div className="flex gap-2.5">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            value={digit}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Chữ số ${i + 1}`}
            className={cn(
              'ds-transition h-13 w-11 rounded-ds-md border border-ds-border-default bg-ds-surface-base text-center font-ds-heading text-lg font-semibold text-ds-text-primary outline-none focus:border-ds-border-focus focus:ring-2 focus:ring-ds-blue-600/15',
              error && fieldErrorClass,
            )}
            onChange={(e) => {
              const char = e.target.value.replace(/\D/g, '').slice(-1)
              setDigit(i, char)
              if (char && i < length - 1) refs.current[i + 1]?.focus()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digits[i] && i > 0) {
                refs.current[i - 1]?.focus()
              }
            }}
          />
        ))}
      </div>
    </FieldShell>
  )
}

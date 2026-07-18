import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldShell, fieldErrorClass, type FieldShellProps } from './_shared'

const defaultCountryCodes = [
  { label: '🇻🇳 +84', value: '+84' },
  { label: '🇺🇸 +1', value: '+1' },
  { label: '🇸🇬 +65', value: '+65' },
  { label: '🇯🇵 +81', value: '+81' },
  { label: '🇰🇷 +82', value: '+82' },
]

export type PhoneInputProps = Omit<FieldShellProps, 'children' | 'htmlFor'> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> & {
    countryCode?: string
    onCountryCodeChange?: (code: string) => void
    countryCodes?: { label: string; value: string }[]
    inputClassName?: string
  }

/** Country-code select + phone number field, composed as one control. */
export function PhoneInput({
  label,
  helperText,
  error,
  required,
  className,
  inputClassName,
  countryCode = '+84',
  onCountryCodeChange,
  countryCodes = defaultCountryCodes,
  id,
  ...props
}: PhoneInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      className={className}
      htmlFor={inputId}
    >
      <div
        className={cn(
          'ds-transition flex h-11 items-stretch overflow-hidden rounded-ds-md border border-ds-border-default bg-ds-surface-base focus-within:border-ds-border-focus focus-within:ring-2 focus-within:ring-ds-blue-600/15 hover:border-ds-border-strong',
          error && fieldErrorClass,
        )}
      >
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange?.(e.target.value)}
          aria-label="Mã quốc gia"
          className="shrink-0 border-r border-ds-border-default bg-ds-surface-muted px-2.5 text-sm text-ds-text-primary outline-none"
        >
          {countryCodes.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          required={required}
          className={cn(
            'h-full w-full bg-transparent px-3.5 text-sm text-ds-text-primary outline-none placeholder:text-ds-text-muted',
            inputClassName,
          )}
          {...props}
        />
      </div>
    </FieldShell>
  )
}

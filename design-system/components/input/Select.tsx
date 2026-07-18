import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldShell, fieldBaseClass, fieldErrorClass, type FieldShellProps } from './_shared'

export type SelectOption = { label: string; value: string; disabled?: boolean }

export type SelectProps = Omit<FieldShellProps, 'children' | 'htmlFor'> &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    options: SelectOption[]
    placeholder?: string
    selectClassName?: string
  }

/** Dropdown control. Native <select> for zero-dependency, full accessibility and mobile support. */
export function Select({
  label,
  helperText,
  error,
  required,
  className,
  selectClassName,
  options,
  placeholder,
  id,
  ...props
}: SelectProps) {
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
      <div className="relative">
        <select
          id={inputId}
          required={required}
          className={cn(
            fieldBaseClass,
            'appearance-none pr-10',
            error && fieldErrorClass,
            selectClassName,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-muted" />
      </div>
    </FieldShell>
  )
}

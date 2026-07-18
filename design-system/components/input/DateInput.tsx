import { useId } from 'react'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldShell, fieldBaseClass, fieldErrorClass, type FieldShellProps } from './_shared'

export type DateInputProps = Omit<FieldShellProps, 'children' | 'htmlFor'> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> & {
    inputClassName?: string
  }

/** Native date control, styled to match the rest of the Input System. */
export function DateInput({
  label,
  helperText,
  error,
  required,
  className,
  inputClassName,
  id,
  ...props
}: DateInputProps) {
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
        <input
          id={inputId}
          type="date"
          required={required}
          className={cn(
            fieldBaseClass,
            'pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0',
            error && fieldErrorClass,
            inputClassName,
          )}
          {...props}
        />
        <CalendarDays className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-muted" />
      </div>
    </FieldShell>
  )
}

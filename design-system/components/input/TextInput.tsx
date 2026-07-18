import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldShell, fieldBaseClass, fieldErrorClass, type FieldShellProps } from './_shared'

export type TextInputProps = Omit<FieldShellProps, 'children' | 'htmlFor'> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    inputClassName?: string
  }

export function TextInput({
  label,
  helperText,
  error,
  required,
  className,
  inputClassName,
  id,
  ...props
}: TextInputProps) {
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
      <input
        id={inputId}
        required={required}
        className={cn(fieldBaseClass, error && fieldErrorClass, inputClassName)}
        {...props}
      />
    </FieldShell>
  )
}

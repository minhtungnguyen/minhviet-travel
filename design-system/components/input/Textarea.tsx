import { useId } from 'react'
import { cn } from '@/lib/utils'
import { FieldShell, fieldBaseClass, fieldErrorClass, type FieldShellProps } from './_shared'

export type TextareaProps = Omit<FieldShellProps, 'children' | 'htmlFor'> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    textareaClassName?: string
  }

export function Textarea({
  label,
  helperText,
  error,
  required,
  className,
  textareaClassName,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
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
      <textarea
        id={inputId}
        required={required}
        rows={rows}
        className={cn(
          fieldBaseClass,
          'h-auto resize-y py-2.5 leading-relaxed',
          error && fieldErrorClass,
          textareaClassName,
        )}
        {...props}
      />
    </FieldShell>
  )
}

import { cn } from '@/lib/utils'

/** Shared chrome for every field control in the Input System. */
export const fieldBaseClass =
  'ds-transition h-11 w-full rounded-ds-md border border-ds-border-default bg-ds-surface-base px-3.5 text-sm text-ds-text-primary outline-none placeholder:text-ds-text-muted hover:border-ds-border-strong focus:border-ds-border-focus focus:ring-2 focus:ring-ds-blue-600/15 disabled:cursor-not-allowed disabled:bg-ds-surface-muted disabled:text-ds-text-disabled'

export const fieldErrorClass = 'border-ds-danger-default focus:border-ds-danger-default focus:ring-ds-danger-default/15'

export type FieldShellProps = {
  label?: string
  helperText?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
  htmlFor?: string
}

/** Label + control + helper/error text. Every Input System control renders through this. */
export function FieldShell({
  label,
  helperText,
  error,
  required,
  className,
  children,
  htmlFor,
}: FieldShellProps) {
  return (
    <div className={cn('block', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block font-ds-body text-[13px] font-semibold uppercase tracking-[0.04em] text-ds-text-secondary"
        >
          {label}
          {required && <span className="ml-0.5 text-ds-danger-default">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-ds-danger-default">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-ds-text-muted">{helperText}</p>
      ) : null}
    </div>
  )
}

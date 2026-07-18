'use client'

import { useId } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fieldBaseClass } from './_shared'

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  className?: string
  onClear?: () => void
}

export function SearchInput({ className, onClear, value, id, ...props }: SearchInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hasValue = typeof value === 'string' && value.length > 0

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ds-text-muted" />
      <input
        id={inputId}
        type="search"
        value={value}
        className={cn(fieldBaseClass, 'pl-10', hasValue && onClear && 'pr-10')}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Xóa tìm kiếm"
          className="ds-transition absolute right-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-ds-full text-ds-text-muted hover:bg-ds-surface-muted hover:text-ds-text-primary"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

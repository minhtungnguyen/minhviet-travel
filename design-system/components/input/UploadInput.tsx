'use client'

import { useId, useState } from 'react'
import { UploadCloud, FileCheck2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldShell, type FieldShellProps } from './_shared'

export type UploadInputProps = Omit<FieldShellProps, 'children' | 'htmlFor'> & {
  accept?: string
  multiple?: boolean
  onFilesChange?: (files: File[]) => void
  className?: string
}

export function UploadInput({
  label,
  helperText,
  error,
  required,
  className,
  accept,
  multiple,
  onFilesChange,
}: UploadInputProps) {
  const inputId = useId()
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  const handleFiles = (list: FileList | null) => {
    if (!list) return
    const next = Array.from(list)
    setFiles(next)
    onFilesChange?.(next)
  }

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onFilesChange?.(next)
  }

  return (
    <FieldShell
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      className={className}
      htmlFor={inputId}
    >
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'ds-transition flex cursor-pointer flex-col items-center justify-center gap-2 rounded-ds-lg border border-dashed px-6 py-8 text-center',
          dragging
            ? 'border-ds-border-focus bg-ds-interactive-subtle'
            : 'border-ds-border-default bg-ds-surface-subtle hover:border-ds-border-strong',
        )}
      >
        <UploadCloud className="size-6 text-ds-text-muted" />
        <p className="text-sm text-ds-text-secondary">
          Kéo thả tệp vào đây hoặc <span className="text-ds-interactive-default">chọn tệp</span>
        </p>
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-ds-md border border-ds-border-subtle bg-ds-surface-base px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate text-ds-text-primary">
                <FileCheck2 className="size-4 shrink-0 text-ds-success-default" />
                <span className="truncate">{f.name}</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Xóa ${f.name}`}
                className="ds-transition shrink-0 text-ds-text-muted hover:text-ds-danger-default"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </FieldShell>
  )
}

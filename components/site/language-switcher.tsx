'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'vi', label: 'Việt Nam', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
] as const

type LanguageCode = (typeof LANGUAGES)[number]['code']

/**
 * UI-only for now: selecting a language updates local state but does not
 * yet route or translate content. Kept as a flat, typed list with a
 * single `active` code so wiring real i18n later only means swapping
 * this component's internals (e.g. reading/writing a locale cookie or
 * route segment) — call sites don't need to change.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<LanguageCode>('vi')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const current = LANGUAGES.find((l) => l.code === active)!

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md px-1 py-1 transition-colors hover:text-accent"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Chọn ngôn ngữ"
      >
        <Globe className="size-3.5" />
        <span aria-hidden>{current.flag}</span>
        <ChevronDown className={cn('size-3 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Ngôn ngữ"
          className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-lg border border-border bg-background py-1.5 shadow-2xl"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === active}
                onClick={() => {
                  setActive(lang.code)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary hover:text-accent',
                  lang.code === active ? 'font-semibold text-accent' : 'text-foreground',
                )}
              >
                <span aria-hidden>{lang.flag}</span>
                {lang.label}
                {lang.code === active && <Check className="ml-auto size-3.5" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { createPageAction, checkSlugAvailableAction } from '@/app/admin/cms/actions'

const PAGE_TYPES = [
  'STATIC_PAGE', 'LANDING_PAGE', 'SERVICE_HUB', 'PROGRAM_INSPIRATION',
  'ARTICLE_INDEX', 'PRODUCT_INDEX', 'CONTACT', 'POLICY', 'CUSTOM',
] as const

const LOCALES = ['vi', 'en', 'zh', 'ko', 'ja'] as const

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

export function CmsPageCreateForm({ websites }: { websites: { id: string; name: string; domain: string }[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [websiteId, setWebsiteId] = useState(websites[0]?.id ?? '')
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>('vi')
  const [pageType, setPageType] = useState<(typeof PAGE_TYPES)[number]>('STATIC_PAGE')
  const [slugCheck, setSlugCheck] = useState<'checking' | 'available' | 'taken'>('checking')
  // Derived, not effect-driven: whenever slug/websiteId is empty the field
  // is simply idle, regardless of the last debounced check's result.
  const slugStatus = !slug || !websiteId ? 'idle' : slugCheck

  useEffect(() => {
    if (!slug || !websiteId) return
    const timeout = setTimeout(() => {
      setSlugCheck('checking')
      void checkSlugAvailableAction(websiteId, locale, slug).then((result) => {
        if (result.available !== null) setSlugCheck(result.available ? 'available' : 'taken')
      })
    }, 400)
    return () => clearTimeout(timeout)
  }, [slug, websiteId, locale])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createPageAction({ websiteId, locale, pageType, slug }, title)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push(`/admin/cms/${result.pageId}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-5">
      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <label className="block">
        <span className={labelClass}>Website</span>
        <select className={inputClass} value={websiteId} onChange={(e) => setWebsiteId(e.target.value)} required>
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.domain})
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Locale</span>
          <select className={inputClass} value={locale} onChange={(e) => setLocale(e.target.value as (typeof LOCALES)[number])}>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Loại trang</span>
          <select className={inputClass} value={pageType} onChange={(e) => setPageType(e.target.value as (typeof PAGE_TYPES)[number])}>
            {PAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Tiêu đề (bản nháp đầu tiên)</span>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={300} />
      </label>

      <label className="block">
        <span className={labelClass}>Slug</span>
        <input
          className={inputClass}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="vi-du-ve-slug"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          required
        />
        <span className="text-[11px] text-muted-foreground">Chữ thường, nối bằng dấu gạch ngang. Trang sẽ hiện tại /{slug || '...'}.</span>
        {slugStatus === 'checking' && (
          <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Đang kiểm tra slug...
          </span>
        )}
        {slugStatus === 'available' && (
          <span className="mt-1 flex items-center gap-1.5 text-[11px] text-green-600">
            <CheckCircle2 className="size-3" /> Slug khả dụng
          </span>
        )}
        {slugStatus === 'taken' && (
          <span className="mt-1 flex items-center gap-1.5 text-[11px] text-destructive">
            <AlertCircle className="size-3" /> Slug này đã được dùng trên website/locale này
          </span>
        )}
      </label>

      <MVButton type="submit" size="sm" loading={isPending} disabled={!websiteId || slugStatus === 'taken' || slugStatus === 'checking'}>
        Tạo trang
      </MVButton>
    </form>
  )
}

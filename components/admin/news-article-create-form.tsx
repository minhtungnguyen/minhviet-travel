'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { createNewsArticleAction } from '@/app/admin/news/actions'
import { NEWS_SLUG_PREFIX } from '@/lib/cms/news-constants'
import type { NewsCategory } from '@/modules/news-categories/domain/types'

const LOCALES = ['vi', 'en', 'zh', 'ko', 'ja'] as const

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

export function NewsArticleCreateForm({
  websites,
  categories,
}: {
  websites: { id: string; name: string; domain: string }[]
  categories: NewsCategory[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slugSuffix, setSlugSuffix] = useState('')
  const [websiteId, setWebsiteId] = useState(websites[0]?.id ?? '')
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>('vi')
  const activeCategories = categories.filter((c) => c.isActive)
  const [categoryId, setCategoryId] = useState(activeCategories[0]?.id ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createNewsArticleAction({ websiteId, locale, title, slugSuffix, categoryId })
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
        <span className={labelClass}>Danh mục</span>
        <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          {activeCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>Tiêu đề</span>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={300} />
      </label>

      <label className="block">
        <span className={labelClass}>Slug</span>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">/{NEWS_SLUG_PREFIX}</span>
          <input
            className={inputClass}
            value={slugSuffix}
            onChange={(e) => setSlugSuffix(e.target.value)}
            placeholder="ten-bai-viet"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            required
          />
        </div>
      </label>

      <MVButton type="submit" size="sm" loading={isPending} disabled={!websiteId}>
        Tạo bài viết
      </MVButton>
    </form>
  )
}

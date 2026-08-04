'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Check, ImageOff } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { updateSeoMetadataAction } from '@/app/admin/seo/actions'
import { SeoOgImagePicker, type OgImageValue } from '@/components/admin/seo-og-image-picker'
import type { SeoMetadata } from '@/modules/seo/domain/types'

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

/** Sprint 5B: Google SERP-style live preview — pure presentation, reads whatever the form currently holds, no extra data fetched. */
function GoogleSearchPreview({ title, url, description }: { title: string; url: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Xem trước Google Search</p>
      <div className="max-w-xl font-sans">
        <p className="truncate text-sm text-foreground/70">{url || 'https://minhviettravel.com/...'}</p>
        <p className="mt-0.5 truncate text-xl text-[#1a0dab] dark:text-[#8ab4f8]">{title || '(Chưa có tiêu đề)'}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-foreground/80">{description || '(Chưa có mô tả)'}</p>
      </div>
    </div>
  )
}

/** Sprint 5B: OpenGraph card-style live preview. */
function OpenGraphPreview({ title, description, url, imageSrc }: { title: string; description: string; url: string; imageSrc?: string }) {
  let domain = url
  try {
    domain = url ? new URL(url).hostname : 'minhviettravel.com'
  } catch {
    domain = 'minhviettravel.com'
  }
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Xem trước OpenGraph (Facebook/Zalo)</p>
      <div className="max-w-sm overflow-hidden rounded-lg border border-border">
        <div className="flex aspect-[1.91/1] items-center justify-center bg-secondary/40">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary external OG image URL, not a local/optimizable asset
            <img src={imageSrc} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <ImageOff className="size-6" />
              <span className="text-[11px]">Chưa có ảnh OG</span>
            </div>
          )}
        </div>
        <div className="bg-secondary/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{domain}</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{title || '(Chưa có tiêu đề)'}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{description || '(Chưa có mô tả)'}</p>
        </div>
      </div>
    </div>
  )
}

/** Twitter/X "summary_large_image" card-style live preview. */
function TwitterCardPreview({ title, description, url, imageSrc }: { title: string; description: string; url: string; imageSrc?: string }) {
  let domain = url
  try {
    domain = url ? new URL(url).hostname : 'minhviettravel.com'
  } catch {
    domain = 'minhviettravel.com'
  }
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Xem trước Twitter/X</p>
      <div className="max-w-sm overflow-hidden rounded-2xl border border-border">
        <div className="flex aspect-[1.91/1] items-center justify-center bg-secondary/40">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary external OG image URL, not a local/optimizable asset
            <img src={imageSrc} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <ImageOff className="size-6" />
              <span className="text-[11px]">Chưa có ảnh</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-semibold text-foreground">{title || '(Chưa có tiêu đề)'}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{description || '(Chưa có mô tả)'}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{domain}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * `metadata` is null when this entity has never had a `seo_metadata` row
 * (a brand-new Page/News article, for example) — `identity` supplies what
 * a fresh row needs (websiteId/entityType/entityId/locale/defaultSlug).
 * `putMetadata()` upserts either way, so the same submit handler creates
 * the first row or updates an existing one.
 */
export function SeoMetadataForm({
  metadata,
  identity,
  initialOgImage,
}: {
  metadata: SeoMetadata | null
  identity?: { websiteId: string; entityType: string; entityId: string; locale: string; defaultSlug: string; defaultTitle: string }
  /** Server-resolved src for `metadata.ogImageMediaId` (only the id is persisted; the picker needs a src to display it). */
  initialOgImage?: OgImageValue
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    title: metadata?.title ?? identity?.defaultTitle ?? '',
    metaDescription: metadata?.metaDescription ?? '',
    canonicalUrl: metadata?.canonicalUrl ?? '',
    isIndexed: metadata?.isIndexed ?? true,
    isFollowed: metadata?.isFollowed ?? true,
    ogTitle: metadata?.ogTitle ?? '',
    ogDescription: metadata?.ogDescription ?? '',
  })
  const [ogImage, setOgImage] = useState<OgImageValue>(initialOgImage ?? null)

  const websiteId = metadata?.websiteId ?? identity?.websiteId
  const entityType = metadata?.entityType ?? identity?.entityType
  const entityId = metadata?.entityId ?? identity?.entityId
  const locale = metadata?.locale ?? identity?.locale
  const slug = metadata?.slug ?? identity?.defaultSlug

  function handleSave() {
    if (!websiteId || !entityType || !entityId || !locale || slug === undefined) return
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateSeoMetadataAction(entityType, entityId, {
        websiteId,
        locale: locale as 'vi' | 'en' | 'zh' | 'ko' | 'ja',
        title: form.title,
        metaDescription: form.metaDescription || undefined,
        slug,
        canonicalUrl: form.canonicalUrl || undefined,
        isIndexed: form.isIndexed,
        isFollowed: form.isFollowed,
        ogImageMediaId: ogImage?.mediaId,
        // This form has no UI for these two — preserve whatever the row
        // already had rather than wiping them on every save (putMetadata
        // is a full upsert, so an omitted field here means "clear it").
        twitterCardType: metadata?.twitterCardType ?? undefined,
        featuredImageMediaId: metadata?.featuredImageMediaId ?? undefined,
        hreflangGroupId: metadata?.hreflangGroupId ?? undefined,
        ogTitle: form.ogTitle || undefined,
        ogDescription: form.ogDescription || undefined,
        structuredData: metadata?.structuredData ?? {},
        breadcrumbConfig: metadata?.breadcrumbConfig ?? [],
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <div className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <label className="block">
        <span className={labelClass}>Meta Title</span>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        <span className="text-[11px] text-muted-foreground">{form.title.length}/300 ký tự</span>
      </label>
      <label className="block">
        <span className={labelClass}>Meta Description</span>
        <textarea
          className={`${inputClass} h-auto py-2`}
          rows={3}
          value={form.metaDescription}
          onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
        />
        <span className="text-[11px] text-muted-foreground">{form.metaDescription.length}/500 ký tự</span>
      </label>
      <label className="block">
        <span className={labelClass}>Canonical URL</span>
        <input className={inputClass} value={form.canonicalUrl} onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>OG Title</span>
          <input className={inputClass} value={form.ogTitle} onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))} />
        </label>
        <label className="block">
          <span className={labelClass}>OG Description</span>
          <input className={inputClass} value={form.ogDescription} onChange={(e) => setForm((f) => ({ ...f, ogDescription: e.target.value }))} />
        </label>
      </div>
      <div>
        <span className={labelClass}>Ảnh OG (per-page)</span>
        <p className="mb-1 text-[11px] text-muted-foreground">Bỏ trống để dùng ảnh đại diện của trang, sau đó ảnh OG mặc định toàn site.</p>
        <SeoOgImagePicker value={ogImage} onChange={setOgImage} />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={form.isIndexed} onChange={(e) => setForm((f) => ({ ...f, isIndexed: e.target.checked }))} />
          Cho phép index (indexed)
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={form.isFollowed} onChange={(e) => setForm((f) => ({ ...f, isFollowed: e.target.checked }))} />
          Cho phép follow link
        </label>
      </div>
      <div className="space-y-3">
        <GoogleSearchPreview title={form.title} url={form.canonicalUrl} description={form.metaDescription} />
        <OpenGraphPreview
          title={form.ogTitle || form.title}
          description={form.ogDescription || form.metaDescription}
          url={form.canonicalUrl}
          imageSrc={ogImage?.src}
        />
        <TwitterCardPreview
          title={form.ogTitle || form.title}
          description={form.ogDescription || form.metaDescription}
          url={form.canonicalUrl}
          imageSrc={ogImage?.src}
        />
      </div>

      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        {saved && !isPending ? <Check className="size-4" /> : null}
        Lưu
      </MVButton>
    </div>
  )
}

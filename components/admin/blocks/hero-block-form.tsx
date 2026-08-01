'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { MediaPickerInput } from '@/components/admin/media-picker-input'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'
import type { HeroContent } from '@/types/homepage'

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

export function HeroBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: HeroContent }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initial)

  function set<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateBlockConfigAction(pageId, blockId, form as unknown as Record<string, unknown>)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
      <label className="block">
        <span className={labelClass}>Eyebrow</span>
        <input className={inputClass} value={form.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Headline</span>
          <input className={inputClass} value={form.headline} onChange={(e) => set('headline', e.target.value)} />
        </label>
        <label className="block">
          <span className={labelClass}>Headline (nhấn mạnh)</span>
          <input className={inputClass} value={form.headlineAccent} onChange={(e) => set('headlineAccent', e.target.value)} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Subhead</span>
        <textarea
          className={`${inputClass} h-auto py-2`}
          rows={2}
          value={form.subhead}
          onChange={(e) => set('subhead', e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>CTA chính - nhãn</span>
          <input className={inputClass} value={form.primaryCta.label} onChange={(e) => set('primaryCta', { ...form.primaryCta, label: e.target.value })} />
        </label>
        <label className="block">
          <span className={labelClass}>CTA chính - link</span>
          <input className={inputClass} value={form.primaryCta.href} onChange={(e) => set('primaryCta', { ...form.primaryCta, href: e.target.value })} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>CTA phụ - nhãn</span>
          <input className={inputClass} value={form.secondaryCta.label} onChange={(e) => set('secondaryCta', { ...form.secondaryCta, label: e.target.value })} />
        </label>
        <label className="block">
          <span className={labelClass}>CTA phụ - link</span>
          <input className={inputClass} value={form.secondaryCta.href} onChange={(e) => set('secondaryCta', { ...form.secondaryCta, href: e.target.value })} />
        </label>
      </div>
      <div>
        <span className={labelClass}>Ảnh nền</span>
        <div className="mt-1">
          <MediaPickerInput value={form.backgroundImage} onChange={(img) => img && set('backgroundImage', img)} altPlaceholder={form.headline} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 rounded-lg bg-secondary/30 p-3">
        <p className="col-span-2 text-xs font-semibold text-foreground">Chỉ số minh chứng (proof stat)</p>
        <label className="block">
          <span className={labelClass}>Giá trị</span>
          <input type="number" className={inputClass} value={form.proofStat.value} onChange={(e) => set('proofStat', { ...form.proofStat, value: Number(e.target.value) })} />
        </label>
        <label className="block">
          <span className={labelClass}>Hậu tố (vd: +)</span>
          <input className={inputClass} value={form.proofStat.suffix ?? ''} onChange={(e) => set('proofStat', { ...form.proofStat, suffix: e.target.value })} />
        </label>
        <label className="col-span-2 block">
          <span className={labelClass}>Nhãn</span>
          <input className={inputClass} value={form.proofStat.label} onChange={(e) => set('proofStat', { ...form.proofStat, label: e.target.value })} />
        </label>
        <label className="block">
          <span className={labelClass}>Nguồn</span>
          <input className={inputClass} value={form.proofStat.source} onChange={(e) => set('proofStat', { ...form.proofStat, source: e.target.value })} />
        </label>
        <label className="block">
          <span className={labelClass}>Tính đến</span>
          <input className={inputClass} value={form.proofStat.asOf} onChange={(e) => set('proofStat', { ...form.proofStat, asOf: e.target.value })} />
        </label>
      </div>
      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

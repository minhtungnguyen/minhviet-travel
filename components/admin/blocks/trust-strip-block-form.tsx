'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'
import { MediaPickerInput } from '@/components/admin/media-picker-input'
import { updateBlockConfigAction } from '@/app/admin/cms/actions'
import type { PartnerLogo, TrustStripContent } from '@/types/homepage'
import type { VerifiedStat } from '@/types/cms'

const inputClass = 'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary'
const labelClass = 'text-xs font-semibold text-muted-foreground'

function slugify(label: string) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `item-${Date.now()}`
}

export function TrustStripBlockForm({ pageId, blockId, initial }: { pageId: string; blockId: string; initial: TrustStripContent }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initial)

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

  function updateStat(index: number, patch: Partial<VerifiedStat>) {
    setForm((f) => ({ ...f, stats: f.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)) }))
  }
  function addStat() {
    setForm((f) => ({
      ...f,
      stats: [...f.stats, { id: `stat-${Date.now()}`, value: 0, label: '', source: '', asOf: '' }],
    }))
  }
  function removeStat(index: number) {
    setForm((f) => ({ ...f, stats: f.stats.filter((_, i) => i !== index) }))
  }

  function updatePartner(index: number, patch: Partial<PartnerLogo>) {
    setForm((f) => ({ ...f, partners: f.partners.map((p, i) => (i === index ? { ...p, ...patch } : p)) }))
  }
  function addPartner() {
    setForm((f) => ({ ...f, partners: [...f.partners, { id: `partner-${Date.now()}`, name: '', category: 'other' }] }))
  }
  function removePartner(index: number) {
    setForm((f) => ({ ...f, partners: f.partners.filter((_, i) => i !== index) }))
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}

      <label className="block">
        <span className={labelClass}>Eyebrow</span>
        <input className={inputClass} value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} />
      </label>
      <label className="block">
        <span className={labelClass}>Tiêu đề định vị</span>
        <textarea
          className={`${inputClass} h-auto py-2`}
          rows={2}
          value={form.positioning.headline}
          onChange={(e) => setForm((f) => ({ ...f, positioning: { ...f.positioning, headline: e.target.value } }))}
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Số liệu thống kê</p>
          <button type="button" onClick={addStat} className="flex items-center gap-1 text-xs font-semibold text-primary">
            <Plus className="size-3.5" /> Thêm
          </button>
        </div>
        <div className="space-y-3">
          {form.stats.map((stat, i) => (
            <div key={stat.id} className="grid grid-cols-12 gap-2 rounded-lg bg-secondary/30 p-2.5">
              <input
                className={`${inputClass} col-span-2`}
                type="number"
                placeholder="Giá trị"
                value={stat.value}
                onChange={(e) => updateStat(i, { value: Number(e.target.value) })}
              />
              <input
                className={`${inputClass} col-span-2`}
                placeholder="Hậu tố"
                value={stat.suffix ?? ''}
                onChange={(e) => updateStat(i, { suffix: e.target.value })}
              />
              <input
                className={`${inputClass} col-span-4`}
                placeholder="Nhãn"
                value={stat.label}
                onChange={(e) => updateStat(i, { label: e.target.value })}
              />
              <input
                className={`${inputClass} col-span-3`}
                placeholder="Nguồn"
                value={stat.source}
                onChange={(e) => updateStat(i, { source: e.target.value })}
              />
              <button type="button" onClick={() => removeStat(i)} className="col-span-1 flex items-center justify-center text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Logo đối tác</p>
          <button type="button" onClick={addPartner} className="flex items-center gap-1 text-xs font-semibold text-primary">
            <Plus className="size-3.5" /> Thêm
          </button>
        </div>
        <div className="space-y-3">
          {form.partners.map((partner, i) => (
            <div key={partner.id} className="grid grid-cols-12 gap-2 rounded-lg bg-secondary/30 p-2.5">
              <input
                className={`${inputClass} col-span-4`}
                placeholder="Tên đối tác"
                value={partner.name}
                onChange={(e) => updatePartner(i, { name: e.target.value, id: partner.id || slugify(e.target.value) })}
              />
              <select
                className={`${inputClass} col-span-2`}
                value={partner.category}
                onChange={(e) => updatePartner(i, { category: e.target.value as PartnerLogo['category'] })}
              >
                <option value="airline">Hãng bay</option>
                <option value="hotel">Khách sạn</option>
                <option value="other">Khác</option>
              </select>
              <div className="col-span-5">
                <MediaPickerInput
                  value={partner.wordmarkImage ?? null}
                  onChange={(img) => updatePartner(i, { wordmarkImage: img ?? undefined })}
                  altPlaceholder={partner.name}
                />
              </div>
              <button type="button" onClick={() => removePartner(i)} className="col-span-1 flex items-center justify-center text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <MVButton size="sm" loading={isPending} onClick={handleSave}>
        Lưu
      </MVButton>
    </div>
  )
}

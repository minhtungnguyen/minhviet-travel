'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import type { ResolvedSetting, SettingDefinition } from '@/modules/settings/domain/types'

type Item = { definition: SettingDefinition; resolved: ResolvedSetting }

function SettingRow({ item, canWrite, organizationId }: { item: Item; canWrite: boolean; organizationId: string | null }) {
  const router = useRouter()
  const { definition, resolved } = item
  const shortKey = definition.key.slice(definition.namespace.length + 1)
  const [value, setValue] = useState(resolved.value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (definition.isSecret) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
        <div>
          <p className="text-sm font-medium text-foreground">{definition.description || definition.key}</p>
          <p className="text-xs text-muted-foreground">Cấu hình qua biến môi trường server, không hiển thị/sửa tại đây.</p>
        </div>
      </div>
    )
  }

  async function handleSave() {
    if (!organizationId) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/v1/settings/${definition.namespace}/${shortKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scopeLevel: 'ORGANIZATION', scopeResourceId: organizationId, value }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error?.message ?? 'Không thể lưu.')
        return
      }
      setSaved(true)
      router.refresh()
    } catch {
      setError('Có lỗi xảy ra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="sm:max-w-[55%]">
        <p className="text-sm font-medium text-foreground">{definition.description || definition.key}</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="flex items-center gap-2">
        {definition.valueType === 'BOOLEAN' ? (
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled={!canWrite}
            onChange={(e) => setValue(e.target.checked)}
            className="size-5"
          />
        ) : definition.valueType === 'NUMBER' ? (
          <input
            type="number"
            value={typeof value === 'number' ? value : ''}
            disabled={!canWrite}
            onChange={(e) => setValue(Number(e.target.value))}
            className="h-10 w-32 rounded-lg border border-border bg-background px-3 text-sm"
          />
        ) : (
          <input
            type="text"
            value={typeof value === 'string' ? value : JSON.stringify(value)}
            disabled={!canWrite}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 w-64 rounded-lg border border-border bg-background px-3 text-sm"
          />
        )}
        {canWrite && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary/60 disabled:opacity-50"
            aria-label="Lưu"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4 text-primary" /> : <Check className="size-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

export function SettingsForm({
  items,
  canWrite,
  organizationId,
}: {
  items: Item[]
  canWrite: boolean
  organizationId: string | null
}) {
  return (
    <div>
      {items.map((item) => (
        <SettingRow key={item.definition.id} item={item} canWrite={canWrite} organizationId={organizationId} />
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground">Không có cấu hình nào.</p>}
    </div>
  )
}

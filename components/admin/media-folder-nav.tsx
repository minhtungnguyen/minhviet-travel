'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Folder, FolderPlus, Loader2 } from 'lucide-react'
import { createFolderAction } from '@/app/admin/media/actions'
import type { MediaFolder } from '@/modules/media/domain/types'

export function MediaFolderNav({
  folders,
  currentFolderId,
  canWrite,
}: {
  folders: MediaFolder[]
  currentFolderId?: string
  canWrite: boolean
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await createFolderAction(name)
    setSaving(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setName('')
    setCreating(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/admin/media"
        className={`rounded-full px-3 py-1.5 text-sm font-medium ${!currentFolderId ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
      >
        Tất cả
      </Link>
      {folders.map((f) => (
        <Link
          key={f.id}
          href={`/admin/media?folderId=${f.id}`}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${currentFolderId === f.id ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
        >
          <Folder className="size-3.5" />
          {f.name}
        </Link>
      ))}

      {canWrite &&
        (creating ? (
          <form onSubmit={handleCreate} className="flex items-center gap-1.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên thư mục"
              className="h-9 rounded-full border border-border bg-background px-3 text-sm"
            />
            <button type="submit" disabled={saving || !name} className="text-sm font-semibold text-primary disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : 'Tạo'}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary/50"
          >
            <FolderPlus className="size-3.5" />
            Thư mục mới
          </button>
        ))}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

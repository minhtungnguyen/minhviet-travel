'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Folder, FolderPlus, Loader2 } from 'lucide-react'
import { createFolderAction } from '@/app/admin/media/actions'
import type { MediaFolder } from '@/modules/media/domain/types'

/**
 * `media_folders.parent_folder_id` supports nesting, but the UI only
 * ever showed top-level folders. Now takes the FULL folder list and
 * navigates one level at a time: a breadcrumb back to root, chips for
 * the current folder's direct children, and "new folder" creates under
 * whichever folder is currently open.
 */
export function MediaFolderNav({
  allFolders,
  currentFolderId,
  canWrite,
}: {
  allFolders: MediaFolder[]
  currentFolderId?: string
  canWrite: boolean
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const byId = new Map(allFolders.map((f) => [f.id, f]))
  const currentFolder = currentFolderId ? (byId.get(currentFolderId) ?? null) : null

  const breadcrumb: MediaFolder[] = []
  for (let f = currentFolder; f; f = f.parentFolderId ? (byId.get(f.parentFolderId) ?? null) : null) {
    breadcrumb.unshift(f)
  }

  const children = allFolders.filter((f) => (currentFolderId ? f.parentFolderId === currentFolderId : !f.parentFolderId))

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await createFolderAction(name, currentFolderId)
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
    <div className="space-y-2">
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb thư mục">
          <Link href="/admin/media" className="hover:text-foreground hover:underline">
            Tất cả
          </Link>
          {breadcrumb.map((f) => (
            <span key={f.id} className="flex items-center gap-1.5">
              <ChevronRight className="size-3" />
              <Link href={`/admin/media?folderId=${f.id}`} className="hover:text-foreground hover:underline">
                {f.name}
              </Link>
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!currentFolderId && (
          <Link href="/admin/media" className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            Tất cả
          </Link>
        )}
        {children.map((f) => (
          <Link
            key={f.id}
            href={`/admin/media?folderId=${f.id}`}
            className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
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
              {currentFolderId ? 'Thư mục con mới' : 'Thư mục mới'}
            </button>
          ))}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}

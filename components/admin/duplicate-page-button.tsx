'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { duplicatePageAction } from '@/app/admin/cms/actions'

export function DuplicatePageButton({ pageId }: { pageId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await duplicatePageAction(pageId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push(`/admin/cms/${result.pageId}`)
    })
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" disabled={isPending} onClick={handleClick} className="font-medium text-primary hover:underline disabled:opacity-50">
        {isPending ? 'Đang sao chép...' : 'Nhân bản'}
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  )
}

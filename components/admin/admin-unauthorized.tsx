import { ShieldAlert } from 'lucide-react'

/**
 * Rendered when an Admin Shell page's own server-side permission check
 * fails — never relied on alone (the menu already hides the link, and
 * the underlying API call is RLS-backed), but a direct URL hit still
 * needs an honest state instead of a raw 500 or blank page.
 */
export function AdminUnauthorized() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-20 text-center">
      <ShieldAlert className="size-10 text-destructive" />
      <h2 className="font-display text-lg font-semibold text-foreground">Bạn không có quyền truy cập mục này</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
      </p>
    </div>
  )
}

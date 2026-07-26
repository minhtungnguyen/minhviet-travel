import { cn } from '@/lib/utils'

/** Terms checkbox (EPIC-004 §4) — plain text, not a link to a policy page that doesn't exist yet. */
export function FlightBookingTermsCheckbox({
  checked,
  onChange,
  error,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={Boolean(error)}
          className={cn('mt-0.5 size-4 shrink-0 rounded border-border accent-mv-journey-blue', error && 'outline outline-2 outline-destructive/40')}
        />
        <span className="text-sm text-foreground">Tôi đồng ý điều khoản đặt vé.</span>
      </label>
      {error && <p className="mt-1.5 pl-7 text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

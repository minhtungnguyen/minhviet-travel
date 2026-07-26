import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MVButton } from '@/components/mv/mv-button'

/** Booking Actions (EPIC-004 §4 CTA) — "Quay lại" + "Tiếp tục thanh toán". Validation and what happens on a valid submit live in `FlightBookingView` (Payment/EPIC-005 doesn't exist yet — same honesty pattern as every prior epic's "next step" CTA). */
export function FlightBookingActions({
  backHref,
  onContinue,
  sticky = false,
}: {
  backHref: string
  onContinue: () => void
  sticky?: boolean
}) {
  const content = (
    <div className="flex flex-col gap-3">
      <MVButton type="button" variant="accent" size="lg" className="w-full" onClick={onContinue}>
        Tiếp tục thanh toán
      </MVButton>
      {!sticky && (
        <MVButton href={backHref} variant="outline" size="md" className="w-full">
          <ArrowLeft className="size-4" />
          Quay lại
        </MVButton>
      )}
    </div>
  )

  if (!sticky) return content

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur-lg sm:bottom-0 lg:hidden">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-1">
        <Link href={backHref} aria-label="Quay lại" className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">{content}</div>
      </div>
    </div>
  )
}

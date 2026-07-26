import { cn } from '@/lib/utils'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-secondary', className)} />
}

/** Payment/Confirmation Suspense fallback (EPIC-005 §9). */
export function FlightPaymentLoadingSkeleton() {
  return (
    <div className="container-mv max-w-2xl pt-32 pb-16 sm:pt-40 lg:pt-48">
      <SkeletonBlock className="h-64 w-full" />
      <SkeletonBlock className="mt-6 h-48 w-full" />
    </div>
  )
}

import { cn } from '@/lib/utils'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-secondary', className)} />
}

/** Booking Flow Suspense fallback (EPIC-004 §9). */
export function FlightBookingLoadingSkeleton() {
  return (
    <div className="container-mv pt-32 pb-16 sm:pt-40 lg:pt-48">
      <SkeletonBlock className="h-24 w-full" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-56 w-full" />
          <SkeletonBlock className="h-32 w-full" />
        </div>
        <SkeletonBlock className="h-72 w-full" />
      </div>
    </div>
  )
}

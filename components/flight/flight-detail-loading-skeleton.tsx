import { cn } from '@/lib/utils'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-secondary', className)} />
}

/** Flight Detail Suspense fallback (EPIC-003 §9). */
export function FlightDetailLoadingSkeleton() {
  return (
    <div className="container-mv pt-32 pb-16 sm:pt-40 lg:pt-48">
      <SkeletonBlock className="h-5 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-64 w-full" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
        <SkeletonBlock className="h-72 w-full" />
      </div>
    </div>
  )
}

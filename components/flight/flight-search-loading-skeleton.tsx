import { cn } from '@/lib/utils'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-secondary', className)} />
}

/** Search Results Suspense fallback (EPIC-002 §6 / `TECH-006-State-Management.md` §6: skeleton over a full-screen spinner). */
export function FlightSearchLoadingSkeleton() {
  return (
    // Matches `FlightSearchSummary`'s top padding so the skeleton doesn't jump when the real content mounts.
    <div className="container-mv pt-32 pb-6 sm:pt-40 lg:pt-48">
      <SkeletonBlock className="h-16 w-full" />
      <SkeletonBlock className="mt-4 h-20 w-full" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <SkeletonBlock className="hidden h-96 lg:block" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-28 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

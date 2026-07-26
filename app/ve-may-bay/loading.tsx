import { SiteChrome } from '@/components/site/site-chrome'
import { cn } from '@/lib/utils'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-secondary', className)} />
}

export default function FlightHomeLoading() {
  return (
    <SiteChrome>
      <div className="bg-mv-deep-navy pt-32 pb-14 sm:pt-40 lg:pt-48 lg:pb-20">
        <div className="container-mv">
          <SkeletonBlock className="h-4 w-40 bg-white/10" />
          <SkeletonBlock className="mt-6 h-14 w-full max-w-xl bg-white/10 sm:h-16" />
          <SkeletonBlock className="mt-4 h-16 w-full max-w-lg bg-white/10" />
          <SkeletonBlock className="mt-10 h-60 w-full bg-white/10" />
        </div>
      </div>

      <div className="section-py-md container-mv">
        <SkeletonBlock className="h-6 w-48" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-64" />
          ))}
        </div>
      </div>
    </SiteChrome>
  )
}

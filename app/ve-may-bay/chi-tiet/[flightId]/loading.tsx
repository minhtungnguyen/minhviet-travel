import { SiteChrome } from '@/components/site/site-chrome'
import { FlightDetailLoadingSkeleton } from '@/components/flight/flight-detail-loading-skeleton'

export default function FlightDetailLoading() {
  return (
    <SiteChrome>
      <FlightDetailLoadingSkeleton />
    </SiteChrome>
  )
}

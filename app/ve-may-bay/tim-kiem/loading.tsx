import { SiteChrome } from '@/components/site/site-chrome'
import { FlightSearchLoadingSkeleton } from '@/components/flight/flight-search-loading-skeleton'

export default function FlightSearchResultsLoading() {
  return (
    <SiteChrome>
      <FlightSearchLoadingSkeleton />
    </SiteChrome>
  )
}

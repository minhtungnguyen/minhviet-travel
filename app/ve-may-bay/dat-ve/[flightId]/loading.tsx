import { SiteChrome } from '@/components/site/site-chrome'
import { FlightBookingLoadingSkeleton } from '@/components/flight/flight-booking-loading-skeleton'

export default function FlightBookingLoading() {
  return (
    <SiteChrome>
      <FlightBookingLoadingSkeleton />
    </SiteChrome>
  )
}

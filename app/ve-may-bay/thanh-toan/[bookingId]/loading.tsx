import { SiteChrome } from '@/components/site/site-chrome'
import { FlightPaymentLoadingSkeleton } from '@/components/flight/flight-payment-loading-skeleton'

export default function FlightPaymentLoading() {
  return (
    <SiteChrome>
      <FlightPaymentLoadingSkeleton />
    </SiteChrome>
  )
}

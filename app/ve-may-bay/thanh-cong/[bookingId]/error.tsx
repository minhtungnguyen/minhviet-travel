'use client'

import { useEffect } from 'react'
import { SiteChrome } from '@/components/site/site-chrome'
import { FlightErrorState } from '@/components/flight/flight-error-state'

export default function FlightPaymentSuccessError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <SiteChrome>
      <div className="container-mv pt-32 pb-10 sm:pt-40 lg:pt-48">
        <FlightErrorState onRetry={reset} />
      </div>
    </SiteChrome>
  )
}

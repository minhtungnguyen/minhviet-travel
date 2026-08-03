'use client'

import { useEffect } from 'react'
import { ErrorPageChrome } from '@/components/site/error-page-chrome'
import { FlightErrorState } from '@/components/flight/flight-error-state'

export default function FlightSearchResultsError({
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
    <ErrorPageChrome>
      <div className="container-mv pt-32 pb-10 sm:pt-40 lg:pt-48">
        <FlightErrorState onRetry={reset} />
      </div>
    </ErrorPageChrome>
  )
}

'use client'

import { useState } from 'react'
import { FlightDetailSummary } from '@/components/flight/flight-detail-summary'
import { FlightRouteTimeline } from '@/components/flight/flight-route-timeline'
import { FlightFareOptionTabs } from '@/components/flight/flight-fare-option-tabs'
import { FlightFareOptionCard } from '@/components/flight/flight-fare-option-card'
import { FlightBaggageInfo } from '@/components/flight/flight-baggage-info'
import { FlightFareRulesSection } from '@/components/flight/flight-fare-rules'
import { FlightPriceSummary } from '@/components/flight/flight-price-summary'
import { FlightBookingCTA } from '@/components/flight/flight-booking-cta'
import { FlightSupportBox } from '@/components/flight/flight-support-box'
import { FlightDetailFareEmptyState } from '@/components/flight/flight-detail-fare-empty-state'
import { computePriceBreakdown } from '@/lib/flight/flight-detail-price'
import type { FlightDetail } from '@/types/flight'

export function FlightDetailView({ detail, backHref }: { detail: FlightDetail; backHref: string }) {
  const [selectedFareOptionId, setSelectedFareOptionId] = useState(detail.defaultFareOptionId)
  const selectedFareOption =
    detail.fareOptions.find((option) => option.id === selectedFareOptionId) ?? detail.fareOptions[0]

  if (!selectedFareOption) {
    return (
      <div className="pb-24 lg:pb-16">
        <FlightDetailSummary detail={detail} />
        <div className="mt-4">
          <FlightDetailFareEmptyState />
        </div>
      </div>
    )
  }

  const breakdown = computePriceBreakdown(selectedFareOption, detail.query)

  return (
    <div className="pb-32 sm:pb-24 lg:pb-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <FlightDetailSummary detail={detail} />
          <FlightRouteTimeline
            segments={detail.segments}
            layovers={detail.layovers}
            origin={detail.origin}
            destination={detail.destination}
            totalDurationMinutes={detail.durationMinutes}
          />

          <div>
            <p className="mb-3 font-display text-base font-bold text-foreground">Chọn hạng vé</p>
            <FlightFareOptionTabs
              fareOptions={detail.fareOptions}
              selectedId={selectedFareOptionId}
              onSelect={setSelectedFareOptionId}
            />
            <div className="mt-3">
              <FlightFareOptionCard
                fareOption={selectedFareOption}
                selected
                onSelect={() => setSelectedFareOptionId(selectedFareOption.id)}
              />
            </div>
          </div>

          <FlightBaggageInfo baggage={selectedFareOption.baggage} />
          <FlightFareRulesSection fareRules={detail.fareRules} selectedFareOption={selectedFareOption} />
          <FlightSupportBox />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <FlightPriceSummary breakdown={breakdown} disclaimer={detail.fareRules.priceDisclaimer} />
            <FlightBookingCTA fareName={selectedFareOption.name} totalForParty={breakdown.totalForParty} backHref={backHref} />
          </div>
        </aside>

        <div className="lg:hidden">
          <FlightPriceSummary breakdown={breakdown} disclaimer={detail.fareRules.priceDisclaimer} />
        </div>
      </div>

      <FlightBookingCTA fareName={selectedFareOption.name} totalForParty={breakdown.totalForParty} backHref={backHref} sticky />
    </div>
  )
}

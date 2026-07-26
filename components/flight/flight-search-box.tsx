'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight, PlaneTakeoff, PlaneLanding, Search } from 'lucide-react'
import { FlightTripTypeTabs } from '@/components/flight/flight-trip-type-tabs'
import { FlightAirportSelector } from '@/components/flight/flight-airport-selector'
import { FlightDateSelector } from '@/components/flight/flight-date-selector'
import { FlightPassengerSelector, type FlightPassengerCounts } from '@/components/flight/flight-passenger-selector'
import { FlightCabinClassSelector } from '@/components/flight/flight-cabin-class-selector'
import { MVButton } from '@/components/mv/mv-button'
import { flightSearchInputSchema } from '@/lib/flight/flight-schema'
import { buildFlightSearchUrl } from '@/lib/flight/flight-search-url'
import { cn } from '@/lib/utils'
import type { FlightAirport, FlightCabinClass, FlightCabinClassOption, FlightTripType } from '@/types/flight'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/** Prefill for the "Sửa tìm kiếm" panel on Search Results (EPIC-002) — omitted on the homepage, where the box starts empty. */
export interface FlightSearchBoxInitialValues {
  tripType: FlightTripType
  originCode: string
  destinationCode: string
  departDate: string
  returnDate?: string
  passengers: FlightPassengerCounts
  cabinClass: FlightCabinClass
}

export function FlightSearchBox({
  airports,
  cabinClasses,
  defaultOriginCode,
  defaultDestinationCode,
  initialValues,
  className,
}: {
  airports: FlightAirport[]
  cabinClasses: FlightCabinClassOption[]
  defaultOriginCode: string
  defaultDestinationCode: string
  initialValues?: FlightSearchBoxInitialValues
  className?: string
}) {
  const router = useRouter()
  const [tripType, setTripType] = useState<FlightTripType>(initialValues?.tripType ?? 'oneway')
  const [originCode, setOriginCode] = useState(initialValues?.originCode ?? defaultOriginCode)
  const [destinationCode, setDestinationCode] = useState(initialValues?.destinationCode ?? defaultDestinationCode)
  const [departDate, setDepartDate] = useState(initialValues?.departDate ?? '')
  const [returnDate, setReturnDate] = useState(initialValues?.returnDate ?? '')
  const [passengers, setPassengers] = useState<FlightPassengerCounts>(
    initialValues?.passengers ?? { adults: 1, children: 0, infants: 0 },
  )
  const [cabinClass, setCabinClass] = useState<FlightCabinClass>(initialValues?.cabinClass ?? cabinClasses[0]?.value ?? 'economy')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function swapAirports() {
    setOriginCode(destinationCode)
    setDestinationCode(originCode)
  }

  function handleTripTypeChange(next: FlightTripType) {
    setTripType(next)
    if (next === 'oneway') setReturnDate('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = flightSearchInputSchema.safeParse({
      tripType,
      originCode,
      destinationCode,
      departDate,
      returnDate: tripType === 'roundtrip' ? returnDate : undefined,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      cabinClass,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    router.push(
      buildFlightSearchUrl({
        tripType,
        originCode,
        destinationCode,
        departDate,
        returnDate: tripType === 'roundtrip' ? returnDate : undefined,
        ...passengers,
        cabinClass,
      }),
    )
  }

  return (
    <div
      id="tim-chuyen-bay"
      className={cn('scroll-mt-28 rounded-2xl bg-card p-4 shadow-soft-lg sm:p-6', className)}
    >
      <FlightTripTypeTabs value={tripType} onChange={handleTripTypeChange} />

      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end lg:contents">
          <FlightAirportSelector
            label="Điểm đi"
            icon={PlaneTakeoff}
            value={originCode}
            onChange={setOriginCode}
            airports={airports}
            className="lg:min-w-[190px] lg:flex-1"
          />

          <button
            type="button"
            onClick={swapAirports}
            aria-label="Đổi chiều điểm đi và điểm đến"
            className="mx-auto grid size-10 shrink-0 place-items-center self-center rounded-full border border-border bg-background text-mv-journey-blue transition-all duration-mv-normal hover:rotate-180 hover:border-mv-journey-blue focus-visible:ring-2 focus-visible:ring-ring/50 sm:mx-0 sm:mb-[9px]"
          >
            <ArrowLeftRight className="size-4" />
          </button>

          <FlightAirportSelector
            label="Điểm đến"
            icon={PlaneLanding}
            value={destinationCode}
            onChange={setDestinationCode}
            airports={airports}
            className="lg:min-w-[190px] lg:flex-1"
          />
        </div>
        {errors.destinationCode && <p className="text-xs font-medium text-destructive lg:basis-full">{errors.destinationCode}</p>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:contents">
          <FlightDateSelector
            label="Ngày đi"
            value={departDate}
            onChange={setDepartDate}
            min={todayIso()}
            error={errors.departDate}
            className="lg:min-w-[150px] lg:flex-1"
          />
          <FlightDateSelector
            label="Ngày về"
            value={returnDate}
            onChange={setReturnDate}
            min={departDate || todayIso()}
            disabled={tripType === 'oneway'}
            error={errors.returnDate}
            className="lg:min-w-[150px] lg:flex-1"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:contents">
          <FlightPassengerSelector value={passengers} onChange={setPassengers} className="lg:min-w-[160px] lg:flex-1" />
          <FlightCabinClassSelector
            value={cabinClass}
            onChange={setCabinClass}
            options={cabinClasses}
            className="lg:min-w-[170px] lg:flex-1"
          />
        </div>

        <MVButton type="submit" variant="accent" size="lg" className="w-full lg:w-auto lg:shrink-0">
          <Search className="size-5" />
          Tìm chuyến bay
        </MVButton>
      </form>
    </div>
  )
}

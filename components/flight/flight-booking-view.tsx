'use client'

import { useState } from 'react'
import { FlightBookingSummaryCard } from '@/components/flight/flight-booking-summary-card'
import { FlightBookingContactForm } from '@/components/flight/flight-booking-contact-form'
import { FlightBookingPassengerList } from '@/components/flight/flight-booking-passenger-list'
import { FlightBookingExtraServiceCard } from '@/components/flight/flight-booking-extra-service-card'
import { FlightBookingPriceSummarySection } from '@/components/flight/flight-booking-price-summary'
import { FlightBookingTermsCheckbox } from '@/components/flight/flight-booking-terms-checkbox'
import { FlightBookingActions } from '@/components/flight/flight-booking-actions'
import { FlightBookingSuccess } from '@/components/flight/flight-booking-success'
import { bookingContactSchema, createPassengerSchema, bookingTermsSchema } from '@/lib/flight/flight-booking-schema'
import { computeBookingPriceSummary } from '@/lib/flight/flight-booking-price'
import { flightExtraServices } from '@/lib/flight/flight-booking-data'
import type { BookingContactInfo, BookingPassenger, BookingPassengerType, FareOption, FlightDetail } from '@/types/flight'

function buildInitialPassengers(query: FlightDetail['query']): BookingPassenger[] {
  const slots: { type: BookingPassengerType; count: number }[] = [
    { type: 'adult', count: query.adults },
    { type: 'child', count: query.children },
    { type: 'infant', count: query.infants },
  ]

  return slots.flatMap(({ type, count }) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${type}-${index}`,
      type,
      fullName: '',
      gender: 'male' as const,
      dateOfBirth: '',
      nationality: 'Việt Nam',
      documentType: 'cccd' as const,
      documentNumber: '',
    })),
  )
}

type PassengerErrors = Record<string, Partial<Record<keyof BookingPassenger, string>>>

export function FlightBookingView({
  detail,
  fareOption,
  backHref,
}: {
  detail: FlightDetail
  fareOption: FareOption
  backHref: string
}) {
  const [contact, setContact] = useState<BookingContactInfo>({ fullName: '', email: '', phone: '' })
  const [passengers, setPassengers] = useState<BookingPassenger[]>(() => buildInitialPassengers(detail.query))
  const [selectedExtraServiceIds, setSelectedExtraServiceIds] = useState<string[]>([])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof BookingContactInfo, string>>>()
  const [passengerErrors, setPassengerErrors] = useState<PassengerErrors>()
  const [termsError, setTermsError] = useState<string>()
  const [submitted, setSubmitted] = useState(false)

  const selectedExtraServices = flightExtraServices.filter((service) => selectedExtraServiceIds.includes(service.id))
  const priceSummary = computeBookingPriceSummary(fareOption, detail.query, selectedExtraServices)

  function toggleExtraService(id: string) {
    setSelectedExtraServiceIds((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]))
  }

  function handleContinue() {
    const contactResult = bookingContactSchema.safeParse(contact)
    const nextContactErrors = contactResult.success
      ? undefined
      : (Object.fromEntries(
          Object.entries(contactResult.error.flatten().fieldErrors).map(([key, messages]) => [key, messages?.[0]]),
        ) as Partial<Record<keyof BookingContactInfo, string>>)

    const nextPassengerErrors: PassengerErrors = {}
    for (const passenger of passengers) {
      const result = createPassengerSchema(passenger.type, detail.query.departDate).safeParse(passenger)
      if (!result.success) {
        const fieldErrors: Partial<Record<keyof BookingPassenger, string>> = {}
        for (const issue of result.error.issues) {
          const key = String(issue.path[0]) as keyof BookingPassenger
          if (!fieldErrors[key]) fieldErrors[key] = issue.message
        }
        nextPassengerErrors[passenger.id] = fieldErrors
      }
    }

    const termsResult = bookingTermsSchema.safeParse(termsAccepted)

    setContactErrors(nextContactErrors)
    setPassengerErrors(Object.keys(nextPassengerErrors).length > 0 ? nextPassengerErrors : undefined)
    setTermsError(termsResult.success ? undefined : termsResult.error.issues[0]?.message)

    const isValid = contactResult.success && Object.keys(nextPassengerErrors).length === 0 && termsResult.success
    if (isValid) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="pb-16">
        <FlightBookingSuccess grandTotal={priceSummary.grandTotal} />
      </div>
    )
  }

  return (
    <div className="pb-32 sm:pb-24 lg:pb-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <FlightBookingSummaryCard detail={detail} fareOption={fareOption} />
          <FlightBookingContactForm value={contact} onChange={setContact} errors={contactErrors} />
          <FlightBookingPassengerList passengers={passengers} onChange={setPassengers} errors={passengerErrors} />

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-4 font-display text-base font-bold text-foreground">Dịch vụ bổ sung</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {flightExtraServices.map((service) => (
                <FlightBookingExtraServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedExtraServiceIds.includes(service.id)}
                  onToggle={() => toggleExtraService(service.id)}
                />
              ))}
            </div>
          </div>

          <FlightBookingTermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} error={termsError} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <FlightBookingPriceSummarySection summary={priceSummary} />
            <FlightBookingActions backHref={backHref} onContinue={handleContinue} />
          </div>
        </aside>

        <div className="lg:hidden">
          <FlightBookingPriceSummarySection summary={priceSummary} />
        </div>
      </div>

      <FlightBookingActions backHref={backHref} onContinue={handleContinue} sticky />
    </div>
  )
}

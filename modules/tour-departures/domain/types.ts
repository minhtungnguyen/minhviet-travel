export type TourDepartureStatus = 'OPEN' | 'LIMITED' | 'ALMOST_FULL' | 'CLOSED' | 'PENDING_CONFIRMATION'
export type TourPriceType = 'ESTIMATE' | 'CONFIRMED'

export type TourDeparture = {
  id: string
  pageId: string
  departureDate: string
  returnDate: string | null
  price: number
  currency: string
  priceType: TourPriceType
  seatsTotal: number | null
  seatsAvailable: number | null
  status: TourDepartureStatus
  createdAt: string
  updatedAt: string
}

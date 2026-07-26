import { z } from 'zod'
import type { BookingPassengerType } from '@/types/flight'

/**
 * Booking Flow validation (EPIC-004 §8). Error message style mirrors
 * `lib/cms/schema.ts#leadFormSchema` (same "Trường X không hợp lệ"
 * phrasing) so form errors read consistently across the whole site, not
 * just within Flight.
 */

export const bookingContactSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
})

export type BookingContactInput = z.infer<typeof bookingContactSchema>

const AGE_RANGE_BY_TYPE: Record<BookingPassengerType, { minYears: number; maxYears: number | null }> = {
  adult: { minYears: 12, maxYears: null },
  child: { minYears: 2, maxYears: 12 },
  infant: { minYears: 0, maxYears: 2 },
}

/** Age as of `referenceDate` (the flight's departure date, not today — matches how real fare rules band passenger ages). */
function ageInYears(dateOfBirth: string, referenceDate: string): number {
  const dob = new Date(dateOfBirth)
  const ref = new Date(referenceDate)
  let age = ref.getUTCFullYear() - dob.getUTCFullYear()
  const hasNotHadBirthdayYet =
    ref.getUTCMonth() < dob.getUTCMonth() || (ref.getUTCMonth() === dob.getUTCMonth() && ref.getUTCDate() < dob.getUTCDate())
  if (hasNotHadBirthdayYet) age -= 1
  return age
}

/**
 * Schema is built per passenger `type` (adult/child/infant) because the
 * valid date-of-birth range depends on which type slot the passenger was
 * added under — `FlightBookingPassengerList` renders one form per slot
 * from `FlightSearchQuery.adults/children/infants`, so the type is
 * already fixed before the visitor fills anything in.
 */
export function createPassengerSchema(type: BookingPassengerType, departDate: string) {
  return z
    .object({
      id: z.string().min(1),
      type: z.literal(type),
      fullName: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
      gender: z.enum(['male', 'female', 'other']),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ'),
      nationality: z.string().min(1, 'Vui lòng nhập quốc tịch'),
      documentType: z.enum(['cccd', 'passport']),
      documentNumber: z.string().min(4, 'Số giấy tờ không hợp lệ'),
    })
    .refine(
      (passenger) => {
        const dob = new Date(passenger.dateOfBirth)
        return !Number.isNaN(dob.getTime()) && dob.getTime() <= new Date(departDate).getTime()
      },
      { message: 'Ngày sinh phải trước ngày khởi hành', path: ['dateOfBirth'] },
    )
    .refine(
      (passenger) => {
        const range = AGE_RANGE_BY_TYPE[type]
        const age = ageInYears(passenger.dateOfBirth, departDate)
        return age >= range.minYears && (range.maxYears === null || age < range.maxYears)
      },
      { message: 'Ngày sinh không khớp với độ tuổi hành khách đã chọn', path: ['dateOfBirth'] },
    )
}

export type PassengerInput = {
  id: string
  type: BookingPassengerType
  fullName: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  nationality: string
  documentType: 'cccd' | 'passport'
  documentNumber: string
}

export const bookingTermsSchema = z.boolean().refine((accepted) => accepted === true, {
  message: 'Vui lòng đồng ý điều khoản đặt vé',
})

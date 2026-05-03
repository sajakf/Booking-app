import type { Locale } from "./i18n"

export interface ChildDetails {
  name: string
  age: number
  gender: "male" | "female"
}

export interface ParentDetails {
  name: string
  mobile: string
  email: string
}

export type PaymentMethod = "KNET" | "VISA" | "MASTERCARD" | "APPLEPAY" | "TABBY" | "TAMARA"

export type BookingStatus = "draft" | "pending_payment" | "paid" | "cancelled" | "refunded"

export interface BookingLineItem {
  classroomId: string
  classroomName: string
  date: string
  timeSlotId: string
  instructorId: string
  instructorName: string
  unitPrice: number
}

export interface Booking {
  ref: string
  status: BookingStatus
  locale: Locale
  child: ChildDetails
  parent: ParentDetails
  medicalNotes: string
  lineItems: BookingLineItem[]
  isFullWeek: boolean
  subtotal: number
  weekDiscount: number
  promoCode: string | null
  promoDiscount: number
  siblingDiscount: number
  total: number
  currency: "KWD"
  paymentMethod: PaymentMethod | null
  myFatoorahInvoiceId: string | null
  myFatoorahPaymentId: string | null
  createdAt: string
  confirmedAt: string | null
}

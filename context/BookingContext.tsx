"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react"
import type { ChildDetails, ParentDetails, PaymentMethod } from "@/types/booking"
import type { Locale } from "@/types/i18n"

export interface BookingState {
  locale: Locale
  // Step 2
  selectedClassroomId: string | null
  // Step 3
  selectedDays: string[]
  selectedTimeSlot: string | null
  isFullWeek: boolean
  // Step 4
  child: ChildDetails | null
  parent: ParentDetails | null
  medicalNotes: string
  // Step 5
  promoCode: string
  promoDiscount: number
  hasSibling: boolean
  siblingDiscount: number
  // Step 6
  paymentMethod: PaymentMethod | null
  paymentInvoiceId: string | null
  bookingRef: string | null
}

const initialState: BookingState = {
  locale: "en",
  selectedClassroomId: null,
  selectedDays: [],
  selectedTimeSlot: null,
  isFullWeek: false,
  child: null,
  parent: null,
  medicalNotes: "",
  promoCode: "",
  promoDiscount: 0,
  hasSibling: false,
  siblingDiscount: 0,
  paymentMethod: null,
  paymentInvoiceId: null,
  bookingRef: null,
}

type Action =
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "SET_CLASSROOM"; classroomId: string }
  | { type: "SET_SCHEDULE"; days: string[]; timeSlot: string; isFullWeek: boolean }
  | { type: "SET_CHILD_DETAILS"; child: ChildDetails; parent: ParentDetails; medicalNotes: string }
  | { type: "APPLY_PROMO"; code: string; discount: number }
  | { type: "SET_SIBLING"; hasSibling: boolean; discount: number }
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "SET_INVOICE_ID"; invoiceId: string }
  | { type: "CONFIRM_BOOKING"; ref: string }
  | { type: "RESET" }

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "SET_LOCALE":
      return { ...state, locale: action.locale }
    case "SET_CLASSROOM":
      return { ...state, selectedClassroomId: action.classroomId, selectedDays: [], selectedTimeSlot: null, isFullWeek: false }
    case "SET_SCHEDULE":
      return { ...state, selectedDays: action.days, selectedTimeSlot: action.timeSlot, isFullWeek: action.isFullWeek }
    case "SET_CHILD_DETAILS":
      return { ...state, child: action.child, parent: action.parent, medicalNotes: action.medicalNotes }
    case "APPLY_PROMO":
      return { ...state, promoCode: action.code, promoDiscount: action.discount }
    case "SET_SIBLING":
      return { ...state, hasSibling: action.hasSibling, siblingDiscount: action.discount }
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method }
    case "SET_INVOICE_ID":
      return { ...state, paymentInvoiceId: action.invoiceId }
    case "CONFIRM_BOOKING":
      return { ...state, bookingRef: action.ref }
    case "RESET":
      return { ...initialState, locale: state.locale }
    default:
      return state
  }
}

const STORAGE_KEY = "booking_state_v1"

interface BookingContextValue {
  state: BookingState
  dispatch: React.Dispatch<Action>
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingContextProvider({ children, locale }: { children: ReactNode; locale: Locale }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, locale })

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as BookingState
        Object.entries(parsed).forEach(([, value]) => {
          void value
        })
        // Replay all saved state at once via a synthetic init
        dispatch({ type: "SET_LOCALE", locale: parsed.locale ?? locale })
        if (parsed.selectedClassroomId) dispatch({ type: "SET_CLASSROOM", classroomId: parsed.selectedClassroomId })
        if (parsed.selectedDays.length > 0 && parsed.selectedTimeSlot) {
          dispatch({ type: "SET_SCHEDULE", days: parsed.selectedDays, timeSlot: parsed.selectedTimeSlot, isFullWeek: parsed.isFullWeek })
        }
        if (parsed.child && parsed.parent) {
          dispatch({ type: "SET_CHILD_DETAILS", child: parsed.child, parent: parsed.parent, medicalNotes: parsed.medicalNotes })
        }
        if (parsed.promoCode) dispatch({ type: "APPLY_PROMO", code: parsed.promoCode, discount: parsed.promoDiscount })
        if (parsed.hasSibling) dispatch({ type: "SET_SIBLING", hasSibling: true, discount: parsed.siblingDiscount })
        if (parsed.paymentMethod) dispatch({ type: "SET_PAYMENT_METHOD", method: parsed.paymentMethod })
      }
    } catch {
      // Ignore hydration errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist to sessionStorage on state change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage errors
    }
  }, [state])

  return <BookingContext.Provider value={{ state, dispatch }}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBooking must be used within BookingContextProvider")
  return ctx
}

"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react"
import type { ChildDetails, ParentDetails, PaymentMethod, SelectedSession } from "@/types/booking"
import type { Locale } from "@/types/i18n"

export interface BookingState {
  locale: Locale
  // Step 1 — Child
  child: ChildDetails | null
  // Step 2 — Workshops (1 or 2)
  selectedWorkshopIds: string[]
  // Step 3 — Week/Session
  selectedSessionId: string | null
  selectedDays: string[]            // gender-filtered days for chosen session
  // Step 4 — Parent details
  parent: ParentDetails | null
  medicalNotes: string
  // Step 5 — Review
  promoCode: string
  promoDiscount: number
  hasSibling: boolean
  siblingDiscount: number
  // Step 6 — Payment
  paymentMethod: PaymentMethod | null
  paymentInvoiceId: string | null
  bookingRef: string | null
}

const initialState: BookingState = {
  locale: "en",
  child: null,
  selectedWorkshopIds: [],
  selectedSessionId: null,
  selectedDays: [],
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
  | { type: "SET_CHILD"; child: ChildDetails }
  | { type: "SET_WORKSHOPS"; workshopIds: string[] }
  | { type: "SET_SESSION"; session: SelectedSession }
  | { type: "SET_PARENT_DETAILS"; parent: ParentDetails; medicalNotes: string }
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
    case "SET_CHILD":
      return { ...state, child: action.child, selectedWorkshopIds: [], selectedSessionId: null, selectedDays: [] }
    case "SET_WORKSHOPS":
      return { ...state, selectedWorkshopIds: action.workshopIds, selectedSessionId: null, selectedDays: [] }
    case "SET_SESSION":
      return { ...state, selectedSessionId: action.session.sessionId, selectedDays: action.session.days }
    case "SET_PARENT_DETAILS":
      return { ...state, parent: action.parent, medicalNotes: action.medicalNotes }
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

const STORAGE_KEY = "booking_state_v2"

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
        dispatch({ type: "SET_LOCALE", locale: parsed.locale ?? locale })
        if (parsed.child) dispatch({ type: "SET_CHILD", child: parsed.child })
        if (parsed.selectedWorkshopIds?.length > 0) dispatch({ type: "SET_WORKSHOPS", workshopIds: parsed.selectedWorkshopIds })
        if (parsed.selectedSessionId && parsed.selectedDays?.length > 0) {
          dispatch({ type: "SET_SESSION", session: { sessionId: parsed.selectedSessionId, days: parsed.selectedDays } })
        }
        if (parsed.parent) dispatch({ type: "SET_PARENT_DETAILS", parent: parsed.parent, medicalNotes: parsed.medicalNotes ?? "" })
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

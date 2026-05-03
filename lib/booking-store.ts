import type { Booking } from "@/types/booking"

// In-memory store — data is wiped on server restart (dev only).
// Replace with a real DB (Prisma/Supabase) for production.
const store = new Map<string, Booking>()
const drafts = new Map<string, unknown>()

export const bookingStore = {
  save(booking: Booking) {
    store.set(booking.ref, booking)
  },
  get(ref: string): Booking | undefined {
    return store.get(ref)
  },
  saveDraft(id: string, data: unknown) {
    drafts.set(id, data)
  },
  getDraft(id: string): unknown {
    return drafts.get(id)
  },
  deleteDraft(id: string) {
    drafts.delete(id)
  },
}

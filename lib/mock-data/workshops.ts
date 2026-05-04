import workshopsData from "@/data/workshops.json"

export interface TimeSlot {
  id: string
  label: string
  labelAr: string
  start: string
  end: string
}

export interface Session {
  id: string
  label: string
  labelAr: string
  dateRange: string
  dateRangeAr: string
  startDate: string
  boysDays: string[]
  girlsDays: string[]
}

export interface Workshop {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  color: string
  bgLight: string
  timeSlot: string
  pricePerSession: number
}

export function getWorkshops(): Workshop[] {
  return workshopsData.workshops as Workshop[]
}

export function getSessions(): Session[] {
  return workshopsData.sessions as Session[]
}

export function getTimeSlots(): TimeSlot[] {
  return workshopsData.timeSlots as TimeSlot[]
}

export function getTimeSlot(id: string): TimeSlot | undefined {
  return workshopsData.timeSlots.find((s) => s.id === id) as TimeSlot | undefined
}

export function getSession(id: string): Session | undefined {
  return workshopsData.sessions.find((s) => s.id === id) as Session | undefined
}

export function getWorkshop(id: string): Workshop | undefined {
  return workshopsData.workshops.find((w) => w.id === id) as Workshop | undefined
}

/** Days for a session filtered by child's gender */
export function getDaysForGender(session: Session, gender: "male" | "female"): string[] {
  return gender === "male" ? session.boysDays : session.girlsDays
}

/** Price for a given number of sessions */
export function calcTotal(workshopCount: number, sessionCount: number, pricePerSession: number): number {
  return workshopCount * sessionCount * pricePerSession
}

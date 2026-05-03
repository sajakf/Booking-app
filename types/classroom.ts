export type Gender = "boys" | "girls" | "mixed"

export interface TimeSlot {
  id: string
  label: string
  labelAr: string
  startTime: string
  endTime: string
}

export interface Instructor {
  id: string
  name: string
  nameAr: string
  photoUrl?: string
  specialty: string
  specialtyAr: string
}

export interface ClassroomDay {
  date: string
  instructorId: string
  availableSlots: string[]
  seatsRemaining: number
}

export interface CampWeek {
  id: string
  label: string
  labelAr: string
  startDate: string
  endDate: string
}

export interface Classroom {
  id: string
  name: string
  nameAr: string
  gender: Gender
  ageRange: [number, number]
  pricePerDay: number
  pricePerWeek: number
  weekDiscount: number
  totalSeats: number
  imageUrl?: string
  description: string
  descriptionAr: string
  days: ClassroomDay[]
}

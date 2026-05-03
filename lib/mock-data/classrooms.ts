import data from "@/data/classrooms.json"
import type { Classroom, Instructor, CampWeek, TimeSlot } from "@/types/classroom"

export const campName = data.campName
export const campNameAr = data.campNameAr
export const campLocation = data.campLocation
export const campLocationAr = data.campLocationAr

export const weeks: CampWeek[] = data.weeks
export const timeSlots: TimeSlot[] = data.timeSlots
export const instructors: Instructor[] = data.instructors
export const classrooms: Classroom[] = data.classrooms as Classroom[]

export function getInstructor(id: string): Instructor | undefined {
  return instructors.find((i) => i.id === id)
}

export function getClassroom(id: string): Classroom | undefined {
  return classrooms.find((c) => c.id === id)
}

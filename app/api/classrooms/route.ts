import { NextResponse } from "next/server"
import { classrooms as mockClassrooms, instructors as mockInstructors, weeks, timeSlots } from "@/lib/mock-data/classrooms"
import { db } from "@/lib/db"
import type { Classroom, Instructor } from "@/types/classroom"

export async function GET() {
  // Try to serve from database; fall back to static mock when DB has no classrooms
  const dbClassrooms = await db.classroom.findMany({
    where: { isActive: true },
    include: {
      sessions: {
        where: { isActive: true },
        include: { instructor: true },
      },
    },
  }).catch(() => [])

  if (dbClassrooms.length === 0) {
    return NextResponse.json({ classrooms: mockClassrooms, instructors: mockInstructors, weeks, timeSlots })
  }

  // Collect all active bookings to compute per-day seat counts
  const activeBookings = await db.booking.findMany({
    where: { status: { in: ["PENDING", "PAID"] } },
    select: { lineItemsJson: true },
  }).catch(() => [])

  // Build seat-count map: `${classroomId}:${date}` → booked count
  const seatMap = new Map<string, number>()
  for (const b of activeBookings) {
    try {
      const items = JSON.parse(b.lineItemsJson) as Array<{ classroomId?: string; date?: string }>
      for (const item of items) {
        if (item.classroomId && item.date) {
          const key = `${item.classroomId}:${item.date}`
          seatMap.set(key, (seatMap.get(key) ?? 0) + 1)
        }
      }
    } catch {
      // skip malformed JSON
    }
  }

  // Derive calendar dates from weeks + day-of-week sessions
  const dayIndexMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classrooms: Classroom[] = (dbClassrooms as any[]).map((room) => {
    // Deduplicate instructors for this classroom
    const instructorMap = new Map<string, Instructor>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const s of (room.sessions ?? []) as any[]) {
      if (!s.instructor) continue
      instructorMap.set(s.instructor.id, {
        id: s.instructor.id,
        name: s.instructor.nameEn,
        nameAr: s.instructor.nameAr,
        photoUrl: s.instructor.photo ?? undefined,
        specialty: s.instructor.certifications ?? "",
        specialtyAr: s.instructor.certifications ?? "",
      })
    }

    // Build day entries from each week × sessions
    const days = weeks.flatMap((week) => {
      const weekStart = new Date(week.startDate)
      const weekEnd = new Date(week.endDate)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((room.sessions ?? []) as any[]).flatMap((session) => {
        const targetDow = dayIndexMap[session.day.toUpperCase()]
        if (targetDow === undefined) return []

        // Find all matching calendar dates within this week
        const results = []
        for (const d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
          if (d.getDay() === targetDow) {
            const dateStr = d.toISOString().slice(0, 10)
            const booked = seatMap.get(`${room.id}:${dateStr}`) ?? 0
            results.push({
              date: dateStr,
              instructorId: session.instructor.id,
              availableSlots: [session.startTime < "12:00" ? "morning" : "afternoon"],
              seatsRemaining: Math.max(0, session.seatsTotal - booked),
            })
          }
        }
        return results
      })
    })

    // Sort days chronologically and deduplicate same date+slot
    const seen = new Set<string>()
    const uniqueDays = days.filter((d) => {
      const key = `${d.date}:${d.availableSlots[0]}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).sort((a, b) => a.date.localeCompare(b.date))

    return {
      id: room.id,
      name: room.nameEn,
      nameAr: room.nameAr,
      gender: room.gender.toLowerCase() as Classroom["gender"],
      ageRange: [room.ageRangeMin, room.ageRangeMax] as [number, number],
      pricePerDay: room.pricePerDay,
      pricePerWeek: Math.round(room.pricePerDay * 5 * (1 - room.weekDiscount / 100) * 1000) / 1000,
      weekDiscount: room.weekDiscount,
      totalSeats: room.capacity,
      description: room.activityType ?? room.nameEn,
      descriptionAr: room.nameAr,
      days: uniqueDays,
    }
  })

  const instructors: Instructor[] = Array.from(
    new Map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dbClassrooms as any[]).flatMap((r) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((r.sessions ?? []) as any[]).filter((s) => s.instructor).map((s) => [
          s.instructor.id,
          {
            id: s.instructor.id,
            name: s.instructor.nameEn,
            nameAr: s.instructor.nameAr,
            photoUrl: s.instructor.photo ?? undefined,
            specialty: s.instructor.certifications ?? "",
            specialtyAr: s.instructor.certifications ?? "",
          } satisfies Instructor,
        ])
      )
    ).values()
  )

  return NextResponse.json({ classrooms, instructors, weeks, timeSlots })
}

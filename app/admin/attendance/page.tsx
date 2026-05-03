import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AttendanceSheet from "./AttendanceSheet"

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; classroomId?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const { date: rawDate, classroomId } = await searchParams
  const today = new Date().toISOString().split("T")[0]
  const date = rawDate ?? today

  const classrooms = await db.classroom.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
  })

  // Get all paid bookings
  const bookings = await db.booking.findMany({
    where: { status: "PAID" },
    orderBy: { childName: "asc" },
  })

  // Get attendance records for this date
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const attendanceWhere: Record<string, unknown> = {
    date: { gte: dayStart, lte: dayEnd },
  }
  if (classroomId) attendanceWhere.classroomId = classroomId

  const attendanceRecords = await db.attendance.findMany({
    where: attendanceWhere,
  })

  // If classroom filter: get bookings by classroomId from line items
  const filteredBookings = classroomId
    ? bookings.filter((b) => {
        try {
          const items = JSON.parse(b.lineItemsJson ?? "[]") as { classroomId: string }[]
          return items.some((i) => i.classroomId === classroomId)
        } catch {
          return false
        }
      })
    : bookings

  const attendanceMap = new Map(
    attendanceRecords.map((a) => [a.bookingId, a])
  )

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
      <AttendanceSheet
        date={date}
        classrooms={classrooms}
        bookings={filteredBookings.map((b) => ({
          id: b.id,
          childName: b.childName,
          childAge: b.childAge,
          parentName: b.parentName,
          parentPhone: b.parentPhone,
          bookingRef: b.bookingRef,
          lineItemsJson: b.lineItemsJson,
        }))}
        attendanceMap={Object.fromEntries(
          Array.from(attendanceMap.entries()).map(([k, v]) => [
            k,
            { status: v.status, notes: v.notes ?? "" },
          ])
        )}
        selectedClassroomId={classroomId ?? ""}
      />
    </div>
  )
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [totalBookings, paidBookings, pendingBookings, classrooms, sessions] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: "PAID" } }),
    db.booking.count({ where: { status: "PENDING" } }),
    db.classroom.findMany({
      where: { isActive: true },
      include: { sessions: { where: { isActive: true } } },
    }),
    db.session.findMany({
      where: { isActive: true },
      include: { classroom: true, instructor: true },
    }),
  ])

  // Revenue: sum of totalKwd for paid bookings
  const revenueResult = await db.booking.aggregate({
    _sum: { totalKwd: true },
    where: { status: "PAID" },
  })
  const totalRevenue = revenueResult._sum.totalKwd ?? 0

  // Per-session booking counts for capacity display
  const sessionCapacities = await Promise.all(
    sessions.map(async (s) => {
      const booked = await db.booking.count({
        where: { status: { in: ["PENDING", "PAID"] }, lineItemsJson: { contains: s.classroomId } },
      })
      return {
        id: s.id,
        day: s.day,
        classroomName: s.classroom.nameEn,
        instructorName: s.instructor.nameEn,
        seatsTotal: s.seatsTotal,
        booked,
      }
    })
  )

  // Recent 10 bookings
  const recentBookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      bookingRef: true,
      status: true,
      childName: true,
      parentName: true,
      parentPhone: true,
      totalKwd: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    totalBookings,
    paidBookings,
    pendingBookings,
    totalRevenue,
    classroomCount: classrooms.length,
    sessionCapacities,
    recentBookings,
  })
}

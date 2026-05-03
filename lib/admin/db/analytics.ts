import { db } from "@/lib/db"

export async function getDailyRevenue(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  const bookings = await db.booking.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: since },
    },
    select: { paidAt: true, totalKwd: true },
    orderBy: { paidAt: "asc" },
  })

  const map = new Map<string, number>()
  for (const b of bookings) {
    const day = (b.paidAt ?? b.paidAt ?? since).toISOString().split("T")[0]
    map.set(day, (map.get(day) ?? 0) + b.totalKwd)
  }

  // Fill all days even if 0 revenue
  const result: { date: string; revenue: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    result.push({ date: key, revenue: parseFloat((map.get(key) ?? 0).toFixed(3)) })
  }
  return result
}

export async function getTotals() {
  const [totalRevResult, totalBookings, paidBookings] = await Promise.all([
    db.booking.aggregate({
      where: { status: "PAID" },
      _sum: { totalKwd: true },
      _count: true,
    }),
    db.booking.count(),
    db.booking.count({ where: { status: "PAID" } }),
  ])

  return {
    totalRevenue: parseFloat((totalRevResult._sum.totalKwd ?? 0).toFixed(3)),
    totalBookings,
    paidBookings,
  }
}

export async function getPaymentMethodBreakdown() {
  const bookings = await db.booking.findMany({
    where: { status: "PAID" },
    select: { paymentMethod: true },
  })

  const map = new Map<string, number>()
  for (const b of bookings) {
    const method = b.paymentMethod ?? "UNKNOWN"
    map.set(method, (map.get(method) ?? 0) + 1)
  }

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

export async function getCapacityByClassroom() {
  const classrooms = await db.classroom.findMany({
    where: { isActive: true },
    select: { id: true, nameEn: true, capacity: true },
  })

  const results = await Promise.all(
    classrooms.map(async (c) => {
      const booked = await db.booking.count({
        where: {
          status: "PAID",
          lineItemsJson: { contains: c.id },
        },
      })
      const fill = c.capacity > 0 ? Math.round((booked / c.capacity) * 100) : 0
      return { classroom: c.nameEn, capacity: c.capacity, booked, fill }
    })
  )
  return results
}

export async function getPopularClassrooms() {
  const classrooms = await db.classroom.findMany({
    where: { isActive: true },
    select: { id: true, nameEn: true },
  })

  const counts = await Promise.all(
    classrooms.map(async (c) => {
      const count = await db.booking.count({
        where: {
          status: "PAID",
          lineItemsJson: { contains: c.id },
        },
      })
      return { name: c.nameEn, bookings: count }
    })
  )
  return counts.sort((a, b) => b.bookings - a.bookings).slice(0, 8)
}

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, DollarSign, Users, Clock } from "lucide-react"
import Link from "next/link"

function statusColor(status: string) {
  if (status === "PAID") return "default"
  if (status === "PENDING") return "secondary"
  if (status === "CANCELLED" || status === "FAILED") return "destructive"
  return "outline"
}

export default async function DashboardPage() {
  await getServerSession(authOptions)

  const [totalBookings, paidBookings, pendingBookings, sessions] = await Promise.all([
    db.booking.count(),
    db.booking.count({ where: { status: "PAID" } }),
    db.booking.count({ where: { status: "PENDING" } }),
    db.session.findMany({
      where: { isActive: true },
      include: { classroom: true, instructor: true },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    }),
  ])

  const revenueResult = await db.booking.aggregate({
    _sum: { totalKwd: true },
    where: { status: "PAID" },
  })
  const totalRevenue = revenueResult._sum.totalKwd ?? 0

  const recentBookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const dayOrder = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-full bg-blue-100 p-2"><BookOpen className="size-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-full bg-green-100 p-2"><DollarSign className="size-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Revenue (KWD)</p>
              <p className="text-2xl font-bold">{Number(totalRevenue).toFixed(3)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-full bg-emerald-100 p-2"><Users className="size-5 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-2xl font-bold">{paidBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-full bg-amber-100 p-2"><Clock className="size-5 text-amber-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{pendingBookings}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schedule capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions
              .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
              .map((s) => (
                <div key={s.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{s.day.slice(0,3)} — {s.classroom.nameEn}</span>
                    <span className="text-gray-500 text-xs">{s.instructor.nameEn}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: "0%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{s.seatsTotal} seats total</p>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Link href="/admin/bookings" className="text-xs text-blue-600 hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-gray-400">No bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{b.childName}</p>
                      <p className="text-xs text-gray-500">{b.bookingRef} · {b.parentPhone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={statusColor(b.status) as "default" | "secondary" | "destructive" | "outline"}>
                        {b.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{b.totalKwd.toFixed(3)} KD</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Download } from "lucide-react"
import BookingsFilterBar from "./BookingsFilterBar"

function statusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PAID") return "default"
  if (status === "PENDING") return "secondary"
  if (status === "CANCELLED" || status === "FAILED") return "destructive"
  return "outline"
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams

  const where: Record<string, unknown> = {}
  if (status && status !== "ALL") where.status = status
  if (search) {
    where.OR = [
      { bookingRef: { contains: search } },
      { parentName: { contains: search } },
      { parentEmail: { contains: search } },
      { childName: { contains: search } },
    ]
  }

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const exportUrl = `/api/admin/bookings/export${status || search ? `?${new URLSearchParams({ ...(status ? { status } : {}), ...(search ? { search } : {}) })}` : ""}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <div className="flex items-center gap-2">
          <a href={exportUrl} download>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Download className="size-3.5" />
              Export Excel
            </Button>
          </a>
          <Link href="/admin/bookings/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Manual Booking
            </Button>
          </Link>
        </div>
      </div>

      <BookingsFilterBar currentStatus={status ?? "ALL"} currentSearch={search ?? ""} />

      <div className="text-xs text-gray-500">
        {bookings.length} booking{bookings.length !== 1 ? "s" : ""} shown
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-400">
          No bookings match your filters.
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Ref</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Child</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Parent</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Payment</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                      {b.bookingRef}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{b.childName}, {b.childAge}yr</td>
                  <td className="px-4 py-3 text-gray-600">{b.parentName}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{b.parentPhone}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{b.paymentMethod ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(b.totalKwd).toFixed(3)} KD</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusColor(b.status)}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(b.createdAt).toLocaleDateString("en-KW")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

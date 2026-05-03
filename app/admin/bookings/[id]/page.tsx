import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import BookingStatusForm from "@/components/admin/BookingStatusForm"

function statusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PAID") return "default"
  if (status === "PENDING") return "secondary"
  if (status === "CANCELLED" || status === "FAILED") return "destructive"
  return "outline"
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await db.booking.findUnique({ where: { id } })
  if (!booking) notFound()

  const lineItems = JSON.parse(booking.lineItemsJson ?? "[]")

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="size-4" />
          Bookings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-mono">{booking.bookingRef}</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{booking.bookingRef}</h2>
        <Badge variant={statusColor(booking.status)} className="text-sm px-3 py-1">{booking.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Child</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-gray-500">Name:</span> {booking.childName}</p>
            <p><span className="text-gray-500">Age:</span> {booking.childAge}</p>
            <p><span className="text-gray-500">Gender:</span> {booking.childGender}</p>
            {booking.medicalNotes && <p><span className="text-gray-500">Notes:</span> {booking.medicalNotes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Parent / Guardian</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-gray-500">Name:</span> {booking.parentName}</p>
            <p><span className="text-gray-500">Phone:</span> <a href={`tel:${booking.parentPhone}`} className="text-blue-600">{booking.parentPhone}</a></p>
            <p><span className="text-gray-500">Email:</span> <a href={`mailto:${booking.parentEmail}`} className="text-blue-600">{booking.parentEmail}</a></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Pricing</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-gray-500">Subtotal:</span> {Number(booking.subtotalKwd).toFixed(3)} KD</p>
            <p><span className="text-gray-500">Discount:</span> -{Number(booking.discountKwd).toFixed(3)} KD</p>
            <p className="font-bold border-t pt-1 mt-1"><span className="text-gray-500">Total:</span> {Number(booking.totalKwd).toFixed(3)} KD</p>
            {booking.promoCode && <p><span className="text-gray-500">Promo:</span> {booking.promoCode}</p>}
            {booking.hasSibling && <p><span className="text-gray-500">Sibling discount applied</span></p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Payment</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-gray-500">Status:</span> {booking.paymentStatus}</p>
            {booking.paymentMethod && <p><span className="text-gray-500">Method:</span> {booking.paymentMethod}</p>}
            {booking.paymentId && <p><span className="text-gray-500">Payment ID:</span> <span className="font-mono text-xs">{booking.paymentId}</span></p>}
            {booking.paidAt && <p><span className="text-gray-500">Paid at:</span> {new Date(booking.paidAt).toLocaleString("en-KW")}</p>}
            <p><span className="text-gray-500">Booked at:</span> {new Date(booking.createdAt).toLocaleString("en-KW")}</p>
          </CardContent>
        </Card>
      </div>

      {lineItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Booked Days</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Classroom</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Slot</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lineItems.map((item: { date: string; classroomId: string; timeSlotId: string; unitPrice: number }, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{item.date}</td>
                      <td className="px-3 py-2 text-gray-600">{item.classroomId}</td>
                      <td className="px-3 py-2 text-gray-600">{item.timeSlotId}</td>
                      <td className="px-3 py-2 text-right">{Number(item.unitPrice).toFixed(3)} KD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Change Status</CardTitle></CardHeader>
        <CardContent>
          <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} currentNotes={booking.notes ?? ""} />
        </CardContent>
      </Card>
    </div>
  )
}

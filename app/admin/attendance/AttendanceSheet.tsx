"use client"

import { useState, useOptimistic, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, MinusCircle, MessageSquare } from "lucide-react"

type Booking = {
  id: string
  childName: string
  childAge: number
  parentName: string
  parentPhone: string
  bookingRef: string
  lineItemsJson: string
}

type AttendanceRecord = { status: string; notes: string }

type Classroom = { id: string; nameEn: string }

function statusIcon(s: string) {
  if (s === "PRESENT") return <CheckCircle className="size-4 text-emerald-600" />
  if (s === "ABSENT") return <XCircle className="size-4 text-red-500" />
  return <MinusCircle className="size-4 text-gray-400" />
}

function statusBadge(s: string): "default" | "destructive" | "secondary" | "outline" {
  if (s === "PRESENT") return "default"
  if (s === "ABSENT") return "destructive"
  return "secondary"
}

export default function AttendanceSheet({
  date,
  classrooms,
  bookings,
  attendanceMap,
  selectedClassroomId,
}: {
  date: string
  classrooms: Classroom[]
  bookings: Booking[]
  attendanceMap: Record<string, AttendanceRecord>
  selectedClassroomId: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [optimisticMap, updateOptimistic] = useOptimistic(
    attendanceMap,
    (state, { bookingId, status }: { bookingId: string; status: string }) => ({
      ...state,
      [bookingId]: { ...state[bookingId], status },
    })
  )

  const [notifying, setNotifying] = useState<string | null>(null)

  async function mark(bookingId: string, classroomId: string, status: string) {
    updateOptimistic({ bookingId, status })
    await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, classroomId, date, status }),
    })
    startTransition(() => router.refresh())
  }

  async function markAllPresent() {
    await Promise.all(
      bookings.map((b) => {
        const classroomId = getClassroomId(b.lineItemsJson) ?? selectedClassroomId
        return fetch("/api/admin/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: b.id, classroomId, date, status: "PRESENT" }),
        })
      })
    )
    startTransition(() => router.refresh())
  }

  async function notifyAbsent(booking: Booking) {
    setNotifying(booking.id)
    await fetch("/api/admin/notify-absent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: booking.id, date }),
    })
    setNotifying(null)
  }

  function getClassroomId(lineItemsJson: string): string | null {
    try {
      const items = JSON.parse(lineItemsJson) as { classroomId: string }[]
      return items[0]?.classroomId ?? null
    } catch {
      return null
    }
  }

  function changeDate(newDate: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("date", newDate)
    startTransition(() => router.push(`/admin/attendance?${params}`))
  }

  function changeClassroom(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("classroomId", id)
    else params.delete("classroomId")
    startTransition(() => router.push(`/admin/attendance?${params}`))
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={(e) => changeDate(e.target.value)}
          className="h-8 rounded-md border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Select value={selectedClassroomId || "ALL"} onValueChange={(v) => changeClassroom(v === "ALL" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-48 h-8 text-sm">
            <SelectValue placeholder="All classrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Classrooms</SelectItem>
            {classrooms.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {bookings.length > 0 && (
          <Button size="sm" variant="outline" onClick={markAllPresent} className="gap-1.5">
            <CheckCircle className="size-3.5" />
            Mark All Present
          </Button>
        )}
      </div>

      {/* Sheet */}
      {bookings.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-400">
          No paid bookings found for this date / classroom.
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Child</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Parent</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Ref</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Mark</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Notify</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => {
                const record = optimisticMap[b.id]
                const status = record?.status ?? "—"
                const cid = getClassroomId(b.lineItemsJson) ?? selectedClassroomId

                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{b.childName}, {b.childAge}yr</td>
                    <td className="px-4 py-3 text-gray-600">{b.parentName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      <a href={`tel:${b.parentPhone}`} className="hover:text-blue-600">{b.parentPhone}</a>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-center">
                      {status === "—" ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <Badge variant={statusBadge(status)} className="gap-1">
                          {statusIcon(status)}
                          {status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => mark(b.id, cid, "PRESENT")}
                          title="Present"
                          className={`rounded p-1 transition-colors ${status === "PRESENT" ? "bg-emerald-100" : "hover:bg-gray-100"}`}
                        >
                          <CheckCircle className={`size-4 ${status === "PRESENT" ? "text-emerald-600" : "text-gray-400"}`} />
                        </button>
                        <button
                          onClick={() => mark(b.id, cid, "ABSENT")}
                          title="Absent"
                          className={`rounded p-1 transition-colors ${status === "ABSENT" ? "bg-red-100" : "hover:bg-gray-100"}`}
                        >
                          <XCircle className={`size-4 ${status === "ABSENT" ? "text-red-500" : "text-gray-400"}`} />
                        </button>
                        <button
                          onClick={() => mark(b.id, cid, "EXCUSED")}
                          title="Excused"
                          className={`rounded p-1 transition-colors ${status === "EXCUSED" ? "bg-amber-100" : "hover:bg-gray-100"}`}
                        >
                          <MinusCircle className={`size-4 ${status === "EXCUSED" ? "text-amber-500" : "text-gray-400"}`} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {status === "ABSENT" && (
                        <button
                          onClick={() => notifyAbsent(b)}
                          disabled={notifying === b.id}
                          title="Send WhatsApp alert"
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <MessageSquare className="size-3" />
                          {notifying === b.id ? "Sending…" : "Alert"}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

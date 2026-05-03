import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import WaitlistActions from "./WaitlistActions"

function statusColor(s: string): "default" | "secondary" | "outline" | "destructive" {
  if (s === "WAITING") return "secondary"
  if (s === "OFFERED") return "default"
  if (s === "BOOKED") return "outline"
  return "destructive"
}

export default async function WaitlistPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const entries = await db.waitlist.findMany({
    where: { status: { in: ["WAITING", "OFFERED"] } },
    orderBy: { createdAt: "asc" },
    include: {
      classroom: true,
      session: { include: { instructor: true } },
    },
  })

  // Group by classroom
  const byClassroom = new Map<string, typeof entries>()
  for (const entry of entries) {
    const key = entry.classroom.nameEn
    if (!byClassroom.has(key)) byClassroom.set(key, [])
    byClassroom.get(key)!.push(entry)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Waitlist</h2>
        <span className="text-sm text-gray-500">{entries.length} waiting / offered</span>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-400">
          No one is on the waitlist right now.
        </div>
      ) : (
        Array.from(byClassroom.entries()).map(([classroomName, list]) => (
          <div key={classroomName} className="space-y-2">
            <h3 className="font-semibold text-gray-700">{classroomName}</h3>
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Child</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Parent</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Requested</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium">
                        {entry.childName}, {entry.childAge}yr
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.parentName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        <a href={`tel:${entry.parentPhone}`} className="hover:text-blue-600">
                          {entry.parentPhone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString("en-KW")}
                        {entry.offeredAt && (
                          <span className="block text-amber-600">
                            Offered: {new Date(entry.offeredAt).toLocaleDateString("en-KW")}
                          </span>
                        )}
                        {entry.expiresAt && new Date(entry.expiresAt) > new Date() && (
                          <span className="block text-red-500 text-xs">
                            Expires: {new Date(entry.expiresAt).toLocaleDateString("en-KW")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={statusColor(entry.status)}>{entry.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <WaitlistActions entryId={entry.id} status={entry.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

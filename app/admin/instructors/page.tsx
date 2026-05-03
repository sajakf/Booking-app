import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import InstructorActions from "@/components/admin/InstructorActions"

export default async function InstructorsPage() {
  const instructors = await db.instructor.findMany({
    orderBy: { createdAt: "asc" },
    include: { sessions: { where: { isActive: true }, include: { classroom: true } } },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Instructors</h2>
        <InstructorActions mode="create" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {instructors.map((inst) => (
          <div key={inst.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{inst.nameEn}</h3>
                <p className="text-xs text-gray-500" dir="rtl">{inst.nameAr}</p>
              </div>
              <Badge variant={inst.isActive ? "default" : "secondary"}>
                {inst.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {inst.bio && <p className="text-sm text-gray-600 mb-2">{inst.bio}</p>}
            <div className="text-xs text-gray-500 space-y-0.5">
              {inst.phone && <p>📞 {inst.phone}</p>}
              {inst.email && <p>✉ {inst.email}</p>}
            </div>
            {inst.sessions.length > 0 && (
              <div className="mt-3 border-t pt-2 text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-1">Assigned to:</p>
                {inst.sessions.map((s) => (
                  <p key={s.id}>{s.day.slice(0,3)} — {s.classroom.nameEn}</p>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <InstructorActions mode="edit" instructor={inst} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

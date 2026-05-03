import { db } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import ClassroomActions from "@/components/admin/ClassroomActions"

export default async function ClassroomsPage() {
  const classrooms = await db.classroom.findMany({
    orderBy: { createdAt: "asc" },
    include: { sessions: { where: { isActive: true }, include: { instructor: true } } },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Classrooms</h2>
        <ClassroomActions mode="create" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classrooms.map((c) => (
          <div key={c.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{c.nameEn}</h3>
                <p className="text-xs text-gray-500" dir="rtl">{c.nameAr}</p>
              </div>
              <Badge variant={c.isActive ? "default" : "secondary"}>
                {c.gender}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>Ages {c.ageRangeMin}–{c.ageRangeMax} · {c.capacity} seats</p>
              <p>{c.pricePerDay.toFixed(3)} KD/day · {c.weekDiscount}% week discount</p>
            </div>
            {c.sessions.length > 0 && (
              <div className="mt-3 border-t pt-2 text-xs text-gray-500">
                <p className="font-medium text-gray-700 mb-1">Schedule:</p>
                {c.sessions.map((s) => (
                  <p key={s.id}>{s.day.slice(0,3)} {s.startTime}–{s.endTime} · {s.instructor.nameEn}</p>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <ClassroomActions mode="edit" classroom={c} />
              <ClassroomActions mode="toggle" classroom={c} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ScheduleBuilder from "./ScheduleBuilder"

export default async function SessionsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")

  const [sessions, classrooms, instructors] = await Promise.all([
    db.session.findMany({
      where: { isActive: true },
      include: { classroom: true, instructor: true },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    }),
    db.classroom.findMany({ where: { isActive: true }, orderBy: { nameEn: "asc" } }),
    db.instructor.findMany({ where: { isActive: true }, orderBy: { nameEn: "asc" } }),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
        <p className="text-sm text-gray-500">Drag instructors onto classroom slots to assign sessions</p>
      </div>
      <ScheduleBuilder
        sessions={sessions}
        classrooms={classrooms}
        instructors={instructors}
      />
    </div>
  )
}

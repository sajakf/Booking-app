"use client"

import { useState, useTransition } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"

type Session = {
  id: string
  day: string
  startTime: string
  endTime: string
  seatsTotal: number
  notes: string | null
  classroom: { id: string; nameEn: string }
  instructor: { id: string; nameEn: string }
}
type Classroom = { id: string; nameEn: string; capacity: number }
type Instructor = { id: string; nameEn: string; photo: string | null }

const DAYS = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]
const DAY_SHORT: Record<string, string> = {
  SUNDAY:"Sun", MONDAY:"Mon", TUESDAY:"Tue",
  WEDNESDAY:"Wed", THURSDAY:"Thu", FRIDAY:"Fri", SATURDAY:"Sat"
}

function InstructorChip({ instructor }: { instructor: Instructor }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `inst-${instructor.id}`,
    data: { type: "instructor", instructorId: instructor.id, instructorName: instructor.nameEn },
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className="cursor-grab active:cursor-grabbing rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-800 select-none"
    >
      {instructor.nameEn}
    </div>
  )
}

function SessionCard({
  session,
  onDelete,
}: {
  session: Session
  onDelete: (id: string) => void
}) {
  return (
    <div className="group relative rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs">
      <p className="font-semibold text-emerald-800 leading-tight">{session.instructor.nameEn}</p>
      <p className="text-emerald-600">{session.startTime}–{session.endTime}</p>
      <p className="text-gray-500">{session.seatsTotal} seats</p>
      <button
        onClick={() => onDelete(session.id)}
        className="absolute top-1 right-1 hidden group-hover:flex size-4 items-center justify-center rounded text-gray-400 hover:text-red-500"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

function DropCell({
  classroomId,
  day,
  sessions,
  onDelete,
}: {
  classroomId: string
  day: string
  sessions: Session[]
  onDelete: (id: string) => void
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `${classroomId}::${day}` })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[72px] rounded-md p-1.5 transition-colors ${
        isOver ? "bg-blue-50 ring-2 ring-blue-400" : "bg-gray-50"
      }`}
    >
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} onDelete={onDelete} />
      ))}
      {sessions.length === 0 && (
        <div className="flex h-full min-h-[56px] items-center justify-center text-xs text-gray-300">
          Drop here
        </div>
      )}
    </div>
  )
}

export default function ScheduleBuilder({
  sessions: initialSessions,
  classrooms,
  instructors,
}: {
  sessions: Session[]
  classrooms: Classroom[]
  instructors: Instructor[]
}) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [activeInstructor, setActiveInstructor] = useState<Instructor | null>(null)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  // Form dialog for creating a new session (click on cell or use + button)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    classroomId: "", instructorId: "", day: "SUNDAY",
    startTime: "09:00", endTime: "12:00", seatsTotal: "15", notes: "",
  })
  const [formSaving, setFormSaving] = useState(false)

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "instructor") {
      const inst = instructors.find((i) => i.id === event.active.data.current?.instructorId)
      if (inst) setActiveInstructor(inst)
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveInstructor(null)
    const { active, over } = event
    if (!over) return

    const instructorId = active.data.current?.instructorId as string | undefined
    if (!instructorId) return

    const [classroomId, day] = (over.id as string).split("::")
    if (!classroomId || !day) return

    // Conflict check: same instructor already in this day
    const conflict = sessions.find(
      (s) => s.instructor.id === instructorId && s.day === day && s.classroom.id !== classroomId
    )
    if (conflict) {
      setError(
        `${active.data.current?.instructorName} is already assigned to ${conflict.classroom.nameEn} on ${day}`
      )
      setTimeout(() => setError(""), 4000)
      return
    }

    const classroom = classrooms.find((c) => c.id === classroomId)!
    const instructor = instructors.find((i) => i.id === instructorId)!

    setFormData({
      classroomId,
      instructorId,
      day,
      startTime: "09:00",
      endTime: "12:00",
      seatsTotal: classroom.capacity.toString(),
      notes: "",
    })
    setFormOpen(true)
  }

  async function handleFormSave() {
    setFormSaving(true)
    const res = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    const created = await res.json()
    setFormSaving(false)
    setFormOpen(false)
    if (res.ok) {
      startTransition(() => {
        setSessions((prev) => [...prev, created])
        router.refresh()
      })
    }
  }

  async function handleDelete(sessionId: string) {
    await fetch(`/api/admin/sessions/${sessionId}`, { method: "DELETE" })
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  function openManualForm() {
    setFormData({
      classroomId: classrooms[0]?.id ?? "",
      instructorId: instructors[0]?.id ?? "",
      day: "SUNDAY",
      startTime: "09:00",
      endTime: "12:00",
      seatsTotal: "15",
      notes: "",
    })
    setFormOpen(true)
  }

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          ⚠ {error}
        </div>
      )}

      <div className="flex gap-4">
        {/* Instructor palette */}
        <div className="w-40 shrink-0">
          <div className="rounded-lg border bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Instructors
            </p>
            <div className="space-y-1.5">
              {instructors.map((inst) => (
                <InstructorChip key={inst.id} instructor={inst} />
              ))}
            </div>
          </div>
          <Button size="sm" variant="outline" className="mt-2 w-full gap-1.5" onClick={openManualForm}>
            <Plus className="size-3.5" />
            New Session
          </Button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-36 py-2 text-left text-xs font-semibold text-gray-500 pl-2">Classroom</th>
                {DAYS.map((d) => (
                  <th key={d} className="py-2 text-center text-xs font-semibold text-gray-500">
                    {DAY_SHORT[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classrooms.map((classroom) => (
                <tr key={classroom.id}>
                  <td className="rounded-md bg-white px-2 py-2 text-xs font-medium text-gray-700 align-top">
                    <p>{classroom.nameEn}</p>
                    <p className="text-gray-400">{classroom.capacity} seats</p>
                  </td>
                  {DAYS.map((day) => {
                    const cellSessions = sessions.filter(
                      (s) => s.classroom.id === classroom.id && s.day === day
                    )
                    return (
                      <td key={day} className="align-top">
                        <DropCell
                          classroomId={classroom.id}
                          day={day}
                          sessions={cellSessions}
                          onDelete={handleDelete}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {classrooms.length === 0 && (
            <div className="rounded-lg border bg-white p-12 text-center text-sm text-gray-400">
              No active classrooms. Add classrooms first.
            </div>
          )}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeInstructor && (
          <div className="rounded-md border border-blue-400 bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-800 shadow-lg">
            {activeInstructor.nameEn}
          </div>
        )}
      </DragOverlay>

      {/* New session dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Classroom</Label>
                <Select value={formData.classroomId} onValueChange={(v) => v && setFormData((f) => ({ ...f, classroomId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {classrooms.map((c) => <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Instructor</Label>
                <Select value={formData.instructorId} onValueChange={(v) => v && setFormData((f) => ({ ...f, instructorId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {instructors.map((i) => <SelectItem key={i.id} value={i.id}>{i.nameEn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Day</Label>
              <Select value={formData.day} onValueChange={(v) => v && setFormData((f) => ({ ...f, day: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Start</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>End</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Seats</Label>
                <Input type="number" value={formData.seatsTotal} onChange={(e) => setFormData((f) => ({ ...f, seatsTotal: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Input value={formData.notes} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Bring swim gear" />
            </div>
            <Button onClick={handleFormSave} disabled={formSaving || isPending} className="w-full">
              {formSaving ? "Saving…" : "Create Session"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DndContext>
  )
}

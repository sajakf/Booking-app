"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"

const DAYS = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]

interface Classroom { id: string; nameEn: string; gender: string }
interface Instructor { id: string; nameEn: string }
interface Session {
  id: string; classroomId: string; instructorId: string; day: string;
  startTime: string; endTime: string; seatsTotal: number; isActive: boolean; notes: string | null
}

interface Props {
  mode: "create" | "edit"
  session?: Session
  classrooms: Classroom[]
  instructors: Instructor[]
}

export default function SessionActions({ mode, session, classrooms, instructors }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    classroomId: session?.classroomId ?? "",
    instructorId: session?.instructorId ?? "",
    day: session?.day ?? "MONDAY",
    startTime: session?.startTime ?? "09:00",
    endTime: session?.endTime ?? "12:00",
    seatsTotal: session?.seatsTotal?.toString() ?? "15",
    notes: session?.notes ?? "",
    isActive: session?.isActive !== undefined ? session.isActive : true,
  })

  function set(k: string, v: string | boolean) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    if (mode === "create") {
      await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/sessions/${session!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button size="sm" variant={mode === "create" ? "default" : "outline"} onClick={() => setOpen(true)} className="gap-1.5">
        {mode === "create" ? <Plus className="size-3.5" /> : <Pencil className="size-3.5" />}
        {mode === "create" ? "Add Session" : "Edit"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add Session" : "Edit Session"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Classroom</Label>
              <Select value={form.classroomId} onValueChange={(v) => v && set("classroomId", v)}>
                <SelectTrigger><SelectValue placeholder="Select classroom…" /></SelectTrigger>
                <SelectContent>
                  {classrooms.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nameEn} ({c.gender})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Instructor</Label>
              <Select value={form.instructorId} onValueChange={(v) => v && set("instructorId", v)}>
                <SelectTrigger><SelectValue placeholder="Select instructor…" /></SelectTrigger>
                <SelectContent>
                  {instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Day</Label>
                <Select value={form.day} onValueChange={(v) => v && set("day", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Start</Label>
                <Input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>End</Label>
                <Input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Total Seats</Label>
              <Input type="number" value={form.seatsTotal} onChange={(e) => set("seatsTotal", e.target.value)} />
            </div>
            {mode === "edit" && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                <Label htmlFor="active">Active</Label>
              </div>
            )}
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving…" : mode === "create" ? "Create Session" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

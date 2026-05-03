"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Power } from "lucide-react"

interface Classroom {
  id: string; nameEn: string; nameAr: string; gender: string;
  capacity: number; ageRangeMin: number; ageRangeMax: number;
  pricePerDay: number; weekDiscount: number; activityType: string | null; isActive: boolean
}

interface Props {
  mode: "create" | "edit" | "toggle"
  classroom?: Classroom
}

export default function ClassroomActions({ mode, classroom }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nameEn: classroom?.nameEn ?? "",
    nameAr: classroom?.nameAr ?? "",
    gender: classroom?.gender ?? "BOYS",
    capacity: classroom?.capacity?.toString() ?? "15",
    ageRangeMin: classroom?.ageRangeMin?.toString() ?? "5",
    ageRangeMax: classroom?.ageRangeMax?.toString() ?? "18",
    pricePerDay: classroom?.pricePerDay?.toString() ?? "5.000",
    weekDiscount: classroom?.weekDiscount?.toString() ?? "10",
    activityType: classroom?.activityType ?? "",
  })

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleToggle() {
    setSaving(true)
    await fetch(`/api/admin/classrooms/${classroom!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !classroom!.isActive }),
    })
    setSaving(false)
    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    if (mode === "create") {
      await fetch("/api/admin/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/classrooms/${classroom!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  if (mode === "toggle") {
    return (
      <Button size="sm" variant="outline" onClick={handleToggle} disabled={saving} className="gap-1.5">
        <Power className="size-3.5" />
        {classroom?.isActive ? "Deactivate" : "Activate"}
      </Button>
    )
  }

  return (
    <>
      <Button
        size="sm"
        variant={mode === "create" ? "default" : "outline"}
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        {mode === "create" ? <Plus className="size-3.5" /> : <Pencil className="size-3.5" />}
        {mode === "create" ? "Add Classroom" : "Edit"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add Classroom" : "Edit Classroom"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name (English)</Label>
                <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Name (Arabic)</Label>
                <Input value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => v && set("gender", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOYS">Boys</SelectItem>
                    <SelectItem value="GIRLS">Girls</SelectItem>
                    <SelectItem value="MIXED">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Capacity (seats)</Label>
                <Input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Min Age</Label>
                <Input type="number" value={form.ageRangeMin} onChange={(e) => set("ageRangeMin", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Max Age</Label>
                <Input type="number" value={form.ageRangeMax} onChange={(e) => set("ageRangeMax", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Week Discount %</Label>
                <Input type="number" value={form.weekDiscount} onChange={(e) => set("weekDiscount", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price/Day (KWD)</Label>
                <Input type="number" step="0.001" value={form.pricePerDay} onChange={(e) => set("pricePerDay", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Activity Type</Label>
                <Input value={form.activityType} onChange={(e) => set("activityType", e.target.value)} placeholder="e.g. STEM, Arts" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving…" : mode === "create" ? "Create Classroom" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil } from "lucide-react"

interface Instructor {
  id: string
  nameEn: string
  nameAr: string
  phone: string | null
  email: string | null
  bio: string | null
  photo: string | null
  certifications: string
  isActive: boolean
}

interface Props {
  mode: "create" | "edit"
  instructor?: Instructor
}

export default function InstructorActions({ mode, instructor }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nameEn: instructor?.nameEn ?? "",
    nameAr: instructor?.nameAr ?? "",
    phone: instructor?.phone ?? "",
    email: instructor?.email ?? "",
    bio: instructor?.bio ?? "",
    photo: instructor?.photo ?? "",
    certifications: instructor?.certifications ?? "",
  })

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    if (mode === "create") {
      await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/instructors/${instructor!.id}`, {
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
      <Button
        size="sm"
        variant={mode === "create" ? "default" : "outline"}
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        {mode === "create" ? <Plus className="size-3.5" /> : <Pencil className="size-3.5" />}
        {mode === "create" ? "Add Instructor" : "Edit"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add Instructor" : "Edit Instructor"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name (English)</Label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => set("nameEn", e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-1">
                <Label>Name (Arabic)</Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => set("nameAr", e.target.value)}
                  placeholder="جين دو"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+965 XXXX XXXX"
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="instructor@camp.kw"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Photo URL</Label>
              <Input
                value={form.photo}
                onChange={(e) => set("photo", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <Label>Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                rows={2}
                placeholder="Short description shown to parents"
              />
            </div>
            <div className="space-y-1">
              <Label>Certifications (comma-separated)</Label>
              <Input
                value={form.certifications}
                onChange={(e) => set("certifications", e.target.value)}
                placeholder="CPR, First Aid, Swimming Coach Level 2"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving
                ? "Saving…"
                : mode === "create"
                ? "Add Instructor"
                : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

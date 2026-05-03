"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const STATUSES = ["PENDING", "PAID", "CANCELLED", "REFUNDED", "FAILED"] as const

interface Props {
  bookingId: string
  currentStatus: string
  currentNotes: string
}

export default function BookingStatusForm({ bookingId, currentStatus, currentNotes }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => v && setStatus(v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Admin Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Optional internal note…"
        />
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </Button>
    </div>
  )
}

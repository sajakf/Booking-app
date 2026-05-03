"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function NewBookingPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    childName: "",
    childAge: "",
    childGender: "BOYS",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    medicalNotes: "",
    totalKwd: "",
    paymentMethod: "CASH",
    notes: "",
  })

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        childAge: Number(form.childAge),
        totalKwd: Number(form.totalKwd),
        subtotalKwd: Number(form.totalKwd),
        discountKwd: 0,
        isCashPayment: form.paymentMethod === "CASH",
        status: "PAID",
        paymentStatus: "SUCCESS",
        lineItemsJson: "[]",
      }),
    })

    setSaving(false)
    if (res.ok) {
      const booking = await res.json()
      router.push(`/admin/bookings/${booking.id}`)
    } else {
      setError("Failed to create booking. Check all fields.")
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ChevronLeft className="size-4" />
          Bookings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium">New Manual Booking</span>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Walk-in / Phone Booking</h2>
      <p className="text-sm text-gray-500">Create a booking for walk-in or phone customers and mark as cash paid.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Child Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Child Name</Label>
                <Input value={form.childName} onChange={(e) => set("childName", e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Age</Label>
                <Input type="number" min={1} max={18} value={form.childAge} onChange={(e) => set("childAge", e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select value={form.childGender} onValueChange={(v) => v && set("childGender", v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOYS">Boy</SelectItem>
                  <SelectItem value="GIRLS">Girl</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Medical / Special Notes</Label>
              <Textarea value={form.medicalNotes} onChange={(e) => set("medicalNotes", e.target.value)} rows={2} placeholder="Allergies, conditions, etc." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Parent / Guardian</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.parentName} onChange={(e) => set("parentName", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} placeholder="+965 XXXX XXXX" required />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={form.parentEmail} onChange={(e) => set("parentEmail", e.target.value)} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Payment</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Total Amount (KWD)</Label>
                <Input type="number" step="0.001" min="0" value={form.totalKwd} onChange={(e) => set("totalKwd", e.target.value)} placeholder="0.000" required />
              </div>
              <div className="space-y-1">
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => v && set("paymentMethod", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="KNET">KNET</SelectItem>
                    <SelectItem value="VISA">Visa</SelectItem>
                    <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Admin Notes</Label>
              <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} placeholder="Internal notes…" />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create Booking"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export default function WaitlistActions({
  entryId,
  status,
}: {
  entryId: string
  status: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [loading, setLoading] = useState<string | null>(null)

  const act = async (action: "offer" | "cancel") => {
    setLoading(action)
    await fetch(`/api/admin/waitlist/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    setLoading(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {status === "WAITING" && (
        <button
          onClick={() => act("offer")}
          disabled={loading !== null}
          className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading === "offer" ? "Offering…" : "Offer Slot"}
        </button>
      )}
      {(status === "WAITING" || status === "OFFERED") && (
        <button
          onClick={() => act("cancel")}
          disabled={loading !== null}
          className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          {loading === "cancel" ? "…" : status === "OFFERED" ? "Revoke" : "Cancel"}
        </button>
      )}
    </div>
  )
}

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

const STATUSES = ["ALL", "PENDING", "PAID", "CANCELLED", "REFUNDED", "FAILED"]

export default function BookingsFilterBar({
  currentStatus,
  currentSearch,
}: {
  currentStatus: string
  currentSearch: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  useEffect(() => {
    const timeout = setTimeout(() => applyFilters(currentStatus, search), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function applyFilters(status: string, q: string) {
    const params = new URLSearchParams()
    if (status && status !== "ALL") params.set("status", status)
    if (q) params.set("search", q)
    const qs = params.toString()
    startTransition(() => {
      router.push(`/admin/bookings${qs ? `?${qs}` : ""}`)
    })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
        <Input
          className="pl-8 h-8 text-sm"
          placeholder="Search parent, child, ref…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Select value={currentStatus} onValueChange={(v) => applyFilters(v ?? "", search)}>
        <SelectTrigger className="w-36 h-8 text-sm">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s === "ALL" ? "All Statuses" : s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

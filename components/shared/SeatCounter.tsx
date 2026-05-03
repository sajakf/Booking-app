import { cn } from "@/lib/utils"

interface SeatCounterProps {
  seatsRemaining: number
  totalSeats: number
  label: string
}

export function SeatCounter({ seatsRemaining, totalSeats, label }: SeatCounterProps) {
  const pct = totalSeats > 0 ? (seatsRemaining / totalSeats) * 100 : 0
  const isCritical = pct <= 30

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", isCritical ? "text-orange-600" : "text-gray-500")}>
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn("h-full rounded-full transition-all", isCritical ? "bg-orange-500" : "bg-blue-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

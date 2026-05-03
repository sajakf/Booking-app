"use client"

export default function CapacityTable({
  data,
}: {
  data: { classroom: string; capacity: number; booked: number; fill: number }[]
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No classrooms found
      </div>
    )
  }

  function fillColor(fill: number) {
    if (fill >= 90) return "bg-red-500"
    if (fill >= 70) return "bg-amber-400"
    return "bg-emerald-500"
  }

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.classroom}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-gray-700 truncate">{row.classroom}</span>
            <span className="text-gray-500 text-xs whitespace-nowrap ml-2">
              {row.booked}/{row.capacity} ({row.fill}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${fillColor(row.fill)}`}
              style={{ width: `${Math.min(row.fill, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

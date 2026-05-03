"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function PopularSlotsChart({ data }: { data: { name: string; bookings: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No booking data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(v) => [Number(v), "bookings"]}
          contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6 }}
        />
        <Bar dataKey="bookings" fill="#3b82f6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-KW", { month: "short", day: "numeric" }),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v} KD`}
          width={60}
        />
        <Tooltip
          formatter={(v) => [`${Number(v).toFixed(3)} KD`, "Revenue"]}
          labelStyle={{ fontSize: 12 }}
          contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

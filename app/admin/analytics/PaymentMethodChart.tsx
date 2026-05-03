"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"]

export default function PaymentMethodChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No payment data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [Number(v), "bookings"]}
          contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 12, color: "#6b7280" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

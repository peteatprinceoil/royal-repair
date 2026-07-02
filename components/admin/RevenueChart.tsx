"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#737688" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#737688" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(v: unknown) => [`$${(v as number).toFixed(2)}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "2px solid #e5e2e1", fontSize: 12 }} />
        <Bar dataKey="revenue" fill="#003ec7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

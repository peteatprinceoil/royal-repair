import { createClient } from "@/lib/supabase/server"
import { RevenueChart } from "@/components/admin/RevenueChart"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from("jobs")
    .select("total, status, payment_type, created_at, paid_at")
    .neq("status", "cancelled")

  const all = jobs ?? []
  const paid = all.filter((j) => j.status === "paid")
  const pending = all.filter((j) => j.status === "pending")

  const totalRevenue = paid.reduce((s, j) => s + j.total, 0)
  const totalAR = pending.reduce((s, j) => s + j.total, 0)
  const avgJobValue = all.length ? (all.reduce((s, j) => s + j.total, 0) / all.length) : 0
  const onsiteCount = paid.filter((j) => j.payment_type === "onsite").length
  const remoteCount = paid.filter((j) => j.payment_type === "remote").length

  // Monthly revenue for chart (last 6 months)
  const monthlyData = getMonthlyRevenue(paid)

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1c1b1b]">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="Total Collected" value={`$${totalRevenue.toFixed(2)}`} color="text-[#006e2a]" />
        <KpiCard label="AR Outstanding" value={`$${totalAR.toFixed(2)}`} color="text-[#6c4600]" />
        <KpiCard label="Avg Job Value" value={`$${avgJobValue.toFixed(2)}`} color="text-[#003ec7]" />
        <KpiCard label="Jobs Collected" value={paid.length.toString()} color="text-[#1c1b1b]" />
      </div>

      {/* Status breakdown */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5">
        <p className="text-xs font-semibold text-[#737688] uppercase tracking-widest mb-3">Job Status</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <StatusRow label="Paid" count={paid.length} color="text-[#006e2a]" />
          <StatusRow label="Pending" count={pending.length} color="text-[#6c4600]" />
          <StatusRow label="Draft" count={all.filter((j) => j.status === "draft").length} color="text-[#434656]" />
          <StatusRow label="On-Site" count={onsiteCount} color="text-[#003ec7]" />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5">
        <p className="text-xs font-semibold text-[#737688] uppercase tracking-widest mb-4">Monthly Revenue</p>
        <RevenueChart data={monthlyData} />
      </div>
    </div>
  )
}

function getMonthlyRevenue(paid: { paid_at: string | null; total: number }[]) {
  const months: Record<string, number> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" })
    months[key] = 0
  }
  paid.forEach(({ paid_at, total }) => {
    if (!paid_at) return
    const d = new Date(paid_at)
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" })
    if (key in months) months[key] += total
  })
  return Object.entries(months).map(([month, revenue]) => ({ month, revenue }))
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4">
      <p className="text-xs font-semibold text-[#737688] uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-[22px] font-bold ${color}`}>{value}</p>
    </div>
  )
}

function StatusRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#434656]">{label}</span>
      <span className={`font-bold ${color}`}>{count}</span>
    </div>
  )
}

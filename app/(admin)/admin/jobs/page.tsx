import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/jobs/StatusBadge"
import Link from "next/link"

export default async function AdminJobsPage() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, customers(name), profiles(full_name)")
    .order("created_at", { ascending: false })

  const all = jobs ?? []
  const collected = all.filter((j) => j.status === "paid").reduce((s, j) => s + j.total, 0)
  const outstanding = all.filter((j) => j.status === "pending").reduce((s, j) => s + j.total, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1c1b1b]">All Jobs</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#737688] uppercase tracking-widest mb-1">Collected</p>
          <p className="text-[22px] font-bold text-[#006e2a]">${collected.toFixed(2)}</p>
        </div>
        <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#737688] uppercase tracking-widest mb-1">Outstanding</p>
          <p className="text-[22px] font-bold text-[#6c4600]">${outstanding.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {all.map((job) => (
          <div key={job.id} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-[#1c1b1b] truncate">{(job.customers as any)?.name}</p>
                <p className="text-sm text-[#434656] truncate">{job.title}</p>
                <p className="text-xs text-[#737688]">Tech: {(job.profiles as any)?.full_name} · {new Date(job.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="font-bold text-[#1c1b1b]">${job.total.toFixed(2)}</p>
                <StatusBadge status={job.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

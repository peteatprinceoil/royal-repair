import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Plus } from "lucide-react"
import { StatusBadge } from "@/components/jobs/StatusBadge"
import type { JobWithCustomer } from "@/lib/types"

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, customers(name, service_address), profiles(full_name)")
    .eq("created_by", user!.id)
    .order("created_at", { ascending: false })

  const outstanding = (jobs ?? [])
    .filter((j) => j.status === "pending")
    .reduce((sum, j) => sum + j.total, 0)

  return (
    <div className="px-5 pt-6">
      {/* AR summary */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5 mb-6">
        <p className="text-sm font-semibold text-[#434656] uppercase tracking-widest mb-1">Outstanding</p>
        <p className="text-[40px] font-bold text-[#003ec7] leading-none">
          ${outstanding.toFixed(2)}
        </p>
      </div>

      {/* New job CTA */}
      <Link
        href="/jobs/new"
        className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base mb-6"
      >
        <Plus size={20} />
        New Charge
      </Link>

      {/* Job list */}
      <div className="space-y-3">
        {jobs?.length === 0 && (
          <div className="text-center py-16 text-[#737688]">
            <p className="text-lg font-semibold">No jobs yet</p>
            <p className="text-sm mt-1">Create your first charge above</p>
          </div>
        )}
        {(jobs as JobWithCustomer[])?.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block bg-white border-2 border-[#e5e2e1] rounded-xl p-4 hover:border-[#003ec7] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#1c1b1b] truncate">{job.customers?.name}</p>
                <p className="text-sm text-[#434656] truncate">{job.title || "No title"}</p>
                <p className="text-xs text-[#737688] mt-1 truncate">{job.customers?.service_address}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[18px] font-bold text-[#1c1b1b]">${job.total.toFixed(2)}</p>
                <div className="mt-1">
                  <StatusBadge status={job.status} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

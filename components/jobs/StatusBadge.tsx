import type { JobStatus } from "@/lib/types"

const styles: Record<JobStatus, string> = {
  paid:      "bg-[#f0fdf4] text-[#006e2a] border border-[#bbf7d0]",
  pending:   "bg-[#fef9c3] text-[#6c4600] border border-[#fde68a]",
  draft:     "bg-[#f0eded] text-[#434656] border border-[#e5e2e1]",
  cancelled: "bg-[#fef2f2] text-[#ba1a1a] border border-[#fecaca]",
}

const labels: Record<JobStatus, string> = {
  paid: "PAID",
  pending: "PENDING",
  draft: "DRAFT",
  cancelled: "CANCELLED",
}

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-widest ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

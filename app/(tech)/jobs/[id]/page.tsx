import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { StatusBadge } from "@/components/jobs/StatusBadge"
import { JobActions } from "@/components/jobs/JobActions"
import { BackButton } from "@/components/BackButton"
import { EditCustomerSheet } from "@/components/customers/EditCustomerSheet"
import type { LineItem } from "@/lib/types"

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ payment?: string }>
}) {
  const { id } = await params
  const { payment } = await searchParams
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("jobs")
    .select("*, customers(name, email, phone, service_address)")
    .eq("id", id)
    .single()

  if (!job) notFound()

  const customer = job.customers as {
    name: string; email: string; phone: string; service_address: string
  }

  return (
    <div className="px-5 pt-6 space-y-6">
      <BackButton fallback="/jobs" />

      {/* Payment success banner */}
      {payment === "success" && (
        <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-xl p-4 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006e2a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-sm font-semibold text-[#006e2a]">Payment confirmed! This job has been marked as paid.</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#1c1b1b]">{job.title || "Untitled"}</h1>
          <p className="text-sm text-[#737688] mt-1">
            {new Date(job.created_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Amount */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5">
        <div className="space-y-2">
          {(job.line_items as LineItem[]).map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-[#434656]">
              <span>{item.description} × {item.quantity}</span>
              <span>${(item.quantity * item.unit_price).toFixed(2)}</span>
            </div>
          ))}
          {job.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-[#006e2a] pt-2 border-t border-[#e5e2e1]">
              <span>On-Site Discount ({job.discount_pct}%)</span>
              <span>−${job.discount_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-[#1c1b1b] pt-2 border-t border-[#e5e2e1]">
            <span>Total</span>
            <span className="text-[#003ec7]">${job.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white border-2 border-[#e5e2e1] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-[#737688] uppercase tracking-widest">Customer</p>
          <EditCustomerSheet
            customer={{ id: job.customer_id, ...customer }}
            jobId={job.id}
          />
        </div>
        <p className="font-semibold text-[#1c1b1b]">{customer.name}</p>
        <p className="text-sm text-[#434656]">{customer.service_address}</p>
        <p className="text-sm text-[#434656]">{customer.phone}</p>
        <p className="text-sm text-[#434656]">{customer.email}</p>
      </div>

      {/* Actions — client component for QR + email */}
      <JobActions
        job={{
          id: job.id,
          status: job.status,
          payment_type: job.payment_type,
          payment_token: job.payment_token,
          total: job.total,
          sent_at: job.sent_at,
          paid_at: job.paid_at,
        }}
      />
    </div>
  )
}

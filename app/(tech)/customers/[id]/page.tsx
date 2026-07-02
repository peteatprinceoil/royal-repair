import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { updateCustomer } from "@/lib/actions/customers"
import { CustomerForm } from "@/components/customers/CustomerForm"
import { StatusBadge } from "@/components/jobs/StatusBadge"
import { BackButton } from "@/components/BackButton"
import type { JobWithCustomer } from "@/lib/types"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: customer }, { data: jobs }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase
      .from("jobs")
      .select("id, title, total, status, created_at")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
  ])

  if (!customer) notFound()

  const boundUpdate = updateCustomer.bind(null, id)

  return (
    <div className="px-5 pt-6 space-y-8">
      <BackButton fallback="/customers" />
      <div>
        <h1 className="text-[24px] font-bold text-[#1c1b1b]">{customer.name}</h1>
        <p className="text-sm text-[#737688] mt-1">{customer.service_address}</p>
      </div>

      <section>
        <h2 className="text-lg font-bold text-[#1c1b1b] mb-4">Edit Details</h2>
        <CustomerForm action={boundUpdate} defaultValues={customer} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1c1b1b]">Job History</h2>
          <Link href={`/jobs/new?customer_id=${id}`} className="text-sm font-semibold text-[#003ec7]">
            + New Job
          </Link>
        </div>
        <div className="space-y-3">
          {jobs?.length === 0 && (
            <p className="text-sm text-[#737688]">No jobs for this customer yet.</p>
          )}
          {(jobs as Pick<JobWithCustomer, "id" | "title" | "total" | "status" | "created_at">[])?.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center justify-between bg-white border-2 border-[#e5e2e1] rounded-xl p-4 hover:border-[#003ec7] transition-colors"
            >
              <div>
                <p className="font-semibold text-[#1c1b1b]">{job.title || "Untitled"}</p>
                <p className="text-xs text-[#737688]">
                  {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1c1b1b]">${job.total.toFixed(2)}</p>
                <StatusBadge status={job.status} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

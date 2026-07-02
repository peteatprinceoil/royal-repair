import { createClient } from "@/lib/supabase/server"
import { AdminNewJobForm } from "@/components/jobs/AdminNewJobForm"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function AdminNewJobPage() {
  const supabase = await createClient()

  const [{ data: customers }, { data: techs }, { data: setting }] = await Promise.all([
    supabase.from("customers").select("id, name, service_address").order("name"),
    supabase.from("profiles").select("id, full_name").eq("role", "tech").order("full_name"),
    supabase.from("settings").select("value").eq("key", "onsite_discount_pct").single(),
  ])

  const discountPct = parseFloat(setting?.value ?? "0")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/jobs" className="text-[#737688] hover:text-[#1c1b1b]">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-[24px] font-bold text-[#1c1b1b]">New Job</h1>
      </div>
      <AdminNewJobForm
        customers={customers ?? []}
        techs={techs ?? []}
        discountPct={discountPct}
      />
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { NewJobForm } from "@/components/jobs/NewJobForm"

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string }>
}) {
  const { customer_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, service_address")
    .eq("created_by", user!.id)
    .order("name")

  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "onsite_discount_pct")
    .single()

  const discountPct = parseFloat(setting?.value ?? "0")

  return (
    <div className="px-5 pt-6">
      <h1 className="text-[24px] font-bold text-[#1c1b1b] mb-6">New Charge</h1>
      <NewJobForm
        customers={customers ?? []}
        defaultCustomerId={customer_id}
        discountPct={discountPct}
      />
    </div>
  )
}

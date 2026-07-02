import { createClient } from "@/lib/supabase/server"

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from("customers")
    .select("*, profiles(full_name)")
    .order("name")

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-bold text-[#1c1b1b]">All Customers</h1>
      <p className="text-sm text-[#737688]">{customers?.length ?? 0} total</p>
      <div className="space-y-3">
        {customers?.map((c) => (
          <div key={c.id} className="bg-white border-2 border-[#e5e2e1] rounded-xl p-4">
            <p className="font-semibold text-[#1c1b1b]">{c.name}</p>
            <p className="text-sm text-[#434656]">{c.service_address}</p>
            <p className="text-xs text-[#737688]">{c.email} · {c.phone}</p>
            <p className="text-xs text-[#737688] mt-0.5">Added by: {(c.profiles as any)?.full_name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

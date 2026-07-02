import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Plus, ChevronRight } from "lucide-react"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from("customers")
    .select("id, name, phone, email, service_address")
    .eq("created_by", user!.id)
    .order("name")

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  const { data: customers } = await query

  return (
    <div className="px-5 pt-6">
      {/* Search */}
      <form className="mb-5">
        <input
          name="q"
          defaultValue={q}
          type="search"
          placeholder="Search by name, email, or phone…"
          className="w-full h-14 px-4 rounded-xl border-2 border-[#e5e2e1] bg-white text-base text-[#1c1b1b] placeholder:text-[#737688] focus:outline-none focus:border-[#003ec7] transition-colors"
        />
      </form>

      <Link
        href="/customers/new"
        className="flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-[#003ec7] text-white font-bold text-base mb-6"
      >
        <Plus size={20} />
        Add Customer
      </Link>

      <div className="space-y-3">
        {customers?.length === 0 && (
          <div className="text-center py-16 text-[#737688]">
            <p className="text-lg font-semibold">No customers yet</p>
            <p className="text-sm mt-1">Add your first customer above</p>
          </div>
        )}
        {customers?.map((c) => (
          <Link
            key={c.id}
            href={`/customers/${c.id}`}
            className="flex items-center justify-between bg-white border-2 border-[#e5e2e1] rounded-xl p-4 hover:border-[#003ec7] transition-colors"
          >
            <div className="min-w-0">
              <p className="font-semibold text-[#1c1b1b] truncate">{c.name}</p>
              <p className="text-sm text-[#434656] truncate">{c.service_address}</p>
              <p className="text-xs text-[#737688] truncate">{c.phone}</p>
            </div>
            <ChevronRight size={20} className="text-[#737688] shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  )
}
